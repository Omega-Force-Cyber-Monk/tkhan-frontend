import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ServiceReviewHeader from "@/components/AdminDashboard/ServiceReview/ServiceReviewHeader";
import ServiceReviewList from "@/components/AdminDashboard/ServiceReview/ServiceReviewList";
import ReviewDetails from "@/components/AdminDashboard/ServiceReview/ReviewDetails";
import CompletionRejectModal from "@/components/AdminDashboard/Shared/CompletionRejectModal";
import { useGetPaymentsQuery } from "@/redux/features/payment/paymentApi";
import {
  useApproveCompletionMutation,
  useGetBookingsQuery,
  useRejectBookingMutation,
} from "@/redux/features/booking/bookingApi";
import {
  mapBookingToReview,
  type AdminBooking,
  type ServiceReviewItem,
} from "@/redux/features/booking/bookingTypes";
import type { Payment } from "@/redux/features/payment/paymentTypes";

const HIDDEN_STATUSES = new Set(["CANCELLED", "REFUNDED"]);

const paymentToBooking = (payment: Payment): AdminBooking | null => {
  const booking = payment.booking;
  if (!booking?.id) return null;

  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    buyerId: booking.buyerId,
    groomerId: booking.groomerId,
    petId: booking.petId,
    status: booking.status,
    note: booking.note,
    completionNote: booking.completionNote,
    beforeImage: booking.beforeImage,
    afterImage: booking.afterImage,
    completionRequestedAt: booking.completionRequestedAt,
    completedAt: booking.completedAt,
    rejectedAt: booking.rejectedAt,
    rejectionReason: booking.rejectionReason,
    totalAmount: booking.totalAmount,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
};

const ServiceReviewPage: React.FC = () => {
  const [selected, setSelected] = useState<ServiceReviewItem | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useGetBookingsQuery({ limit: 50, sortBy: "createdAt", sortOrder: "desc" });

  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetPaymentsQuery();

  const [approveCompletion] = useApproveCompletionMutation();
  const [rejectBooking, { isLoading: isRejecting }] =
    useRejectBookingMutation();

  const reviews = useMemo(() => {
    const fromBookings = bookingsData?.data?.items ?? [];
    const fromPayments = (paymentsData?.data ?? [])
      .map(paymentToBooking)
      .filter((item): item is AdminBooking => Boolean(item));

    const byId = new Map<string, AdminBooking>();
    fromPayments.forEach((booking) => byId.set(booking.id, booking));
    fromBookings.forEach((booking) => byId.set(booking.id, booking));

    return Array.from(byId.values())
      .filter((booking) => !HIDDEN_STATUSES.has(booking.status))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map(mapBookingToReview);
  }, [bookingsData, paymentsData]);

  const isLoading =
    reviews.length === 0 && (bookingsLoading || paymentsLoading);

  const getErrorMessage = (error: unknown) => {
    const err = error as { data?: { message?: string; error?: { message?: string } } };
    return (
      err?.data?.error?.message ||
      err?.data?.message ||
      "Something went wrong. Please try again."
    );
  };

  const handleAccept = async (id: string) => {
    setActingId(id);
    try {
      await approveCompletion(id).unwrap();
      toast.success("Completion accepted");
      setSelected((current) =>
        current && current.id === id
          ? { ...current, status: "accepted", canReview: false, bookingStatus: "COMPLETED" }
          : current,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActingId(null);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectId) return;
    setActingId(rejectId);
    try {
      await rejectBooking({ id: rejectId, reason }).unwrap();
      toast.success("Completion rejected");
      setSelected((current) =>
        current && current.id === rejectId
          ? { ...current, status: "rejected", canReview: false, bookingStatus: "REJECTED" }
          : current,
      );
      setRejectId(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="w-full bg-[#F9FAFB] font-inter">
      <div className="w-full">
        <ServiceReviewHeader />

        <div className="w-full mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
              <Loader2 className="animate-spin" size={20} />
              Loading booking details...
            </div>
          ) : bookingsError && reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center text-gray-500">
              Failed to load booking details. Please try again.
            </div>
          ) : (
            <AnimatePresence>
              {!selected ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ServiceReviewList
                    reviews={reviews}
                    onSelect={(item) => setSelected(item)}
                    onAccept={handleAccept}
                    onReject={(id) => setRejectId(id)}
                    actingId={actingId}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-full lg:w-[min(1090px,100%)]">
                    <ReviewDetails
                      review={selected}
                      onBack={() => setSelected(null)}
                      onAccept={handleAccept}
                      onReject={(id) => setRejectId(id)}
                      actingId={actingId}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <CompletionRejectModal
        isOpen={Boolean(rejectId)}
        onClose={() => setRejectId(null)}
        onConfirm={handleRejectConfirm}
        isLoading={isRejecting}
      />
    </div>
  );
};

export default ServiceReviewPage;
