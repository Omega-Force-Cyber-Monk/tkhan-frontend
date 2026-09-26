import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { PaymentHistoryTable } from "../../components/AdminDashboard/Payment/PaymentHistoryTable";
import { PaymentDetails } from "../../components/AdminDashboard/Payment/PaymentDetails";
import { PlatformPricingTab } from "../../components/AdminDashboard/Payment/PlatformPricing";
import { PendingPaymentsTable } from "../../components/AdminDashboard/Payment/PendingPaymentsTable";
import CompletionRejectModal from "../../components/AdminDashboard/Shared/CompletionRejectModal";

import { Payment } from "../../redux/features/payment/paymentTypes";
import {
  useApproveCompletionMutation,
  useRejectBookingMutation,
} from "../../redux/features/booking/bookingApi";

type View =
  | "LIST_PENDING"
  | "DETAIL_PENDING"
  | "LIST_HISTORY"
  | "DETAIL_HISTORY"
  | "PLATFORM_PRICING";

type ActiveTab = "pending" | "history" | "pricing";

const getAnimationVariants = (isDetailView: boolean) => ({
  initial: isDetailView ? { opacity: 0, x: 20 } : { opacity: 0 },
  animate: isDetailView ? { opacity: 1, x: 0 } : { opacity: 1 },
  exit: isDetailView ? { opacity: 0, x: -20 } : { opacity: 0 },
});

const TABS: { key: ActiveTab; label: string; listView: View }[] = [
  { key: "pending", label: "Pending payments", listView: "LIST_PENDING" },
  { key: "history", label: "Payment History", listView: "LIST_HISTORY" },
  { key: "pricing", label: "Platform Pricing", listView: "PLATFORM_PRICING" },
];

const getErrorMessage = (error: unknown) => {
  const err = error as {
    data?: { message?: string; error?: { message?: string } };
  };
  return (
    err?.data?.error?.message ||
    err?.data?.message ||
    "Something went wrong. Please try again."
  );
};

export default function PaymentsPage() {
  const [view, setView] = useState<View>("LIST_PENDING");
  const [activeTab, setActiveTab] = useState<ActiveTab>("pending");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [actingBookingId, setActingBookingId] = useState<string | null>(null);

  const [approveCompletion] = useApproveCompletionMutation();
  const [rejectBooking, { isLoading: isRejecting }] =
    useRejectBookingMutation();

  const isDetailView = view === "DETAIL_HISTORY" || view === "DETAIL_PENDING";
  const isListView = !isDetailView;
  const variants = getAnimationVariants(isDetailView);
  const completionActingId = actingBookingId;

  const handleAccept = async (bookingId: string) => {
    setActingBookingId(bookingId);
    try {
      await approveCompletion(bookingId).unwrap();
      toast.success("Completion accepted");
      if (view === "DETAIL_PENDING") {
        setView("LIST_PENDING");
        setSelectedPayment(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActingBookingId(null);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectId) return;
    setActingBookingId(rejectId);
    try {
      await rejectBooking({ id: rejectId, reason }).unwrap();
      toast.success("Completion rejected");
      setRejectId(null);
      if (view === "DETAIL_PENDING") {
        setView("LIST_PENDING");
        setSelectedPayment(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setActingBookingId(null);
    }
  };

  const handleTabClick = (tab: { key: ActiveTab; listView: View }): void => {
    setActiveTab(tab.key);
    setView(tab.listView);
    setSelectedPayment(null);
  };

  return (
    <div className="w-full bg-gray-50 font-['Inter']">
      {isListView && (
        <div className="mb-6 md:mb-10">
          <h1 className="text-xl md:text-2xl font-bold text-[#1E293B] tracking-tight">
            Payment Management
          </h1>
          <p className="text-[#64748B] text-[14px] md:text-[16px]">
            Track and manage all transactions
          </p>

          <div className="flex gap-6 md:gap-10 mt-6 md:mt-10 border-b border-[#F1F5F9]">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab)}
                  className={`pb-4 cursor-pointer text-[14px] md:text-[16px] whitespace-nowrap font-medium transition-all relative ${
                    isActive
                      ? "text-[#FF6B35]"
                      : "text-[#94A3B8] hover:text-[#64748B]"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="payTab"
                      className="absolute -bottom-px left-0 right-0 h-[3px] bg-[#FF6B35] rounded-t-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: isDetailView ? 0.3 : 0.15 }}
          >
            {isListView && (
              <>
                {view === "LIST_PENDING" && (
                  <PendingPaymentsTable
                    onViewDetails={(payment) => {
                      setSelectedPayment(payment);
                      setView("DETAIL_PENDING");
                    }}
                  />
                )}

                {view === "LIST_HISTORY" && (
                  <PaymentHistoryTable
                    onViewDetails={(payment) => {
                      setSelectedPayment(payment);
                      setView("DETAIL_HISTORY");
                    }}
                  />
                )}

                {view === "PLATFORM_PRICING" && <PlatformPricingTab />}
              </>
            )}

            {view === "DETAIL_HISTORY" && (
              <PaymentDetails
                onBack={() => {
                  setView("LIST_HISTORY");
                  setSelectedPayment(null);
                }}
                data={selectedPayment}
              />
            )}

            {view === "DETAIL_PENDING" && (
              <PaymentDetails
                onBack={() => {
                  setView("LIST_PENDING");
                  setSelectedPayment(null);
                }}
                data={selectedPayment}
                showCompletionActions
                onAcceptCompletion={handleAccept}
                onRejectCompletion={(bookingId) => setRejectId(bookingId)}
                actingId={completionActingId}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CompletionRejectModal
        isOpen={Boolean(rejectId)}
        onClose={() => setRejectId(null)}
        onConfirm={handleRejectConfirm}
        isLoading={isRejecting}
      />
    </div>
  );
}
