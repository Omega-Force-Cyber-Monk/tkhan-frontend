import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import {
  AdminRefundType,
  useAdminCancelBookingMutation,
  useAdminRefundBookingMutation,
  useGetCancellationPreviewQuery,
} from "../../../redux/features/booking/cancellationApi";

export type CancelRefundMode = "cancel" | "refund";

interface Props {
  isOpen: boolean;
  mode: CancelRefundMode;
  bookingId: string | null;
  bookingNumber?: string;
  /** Amount still refundable (paid minus already refunded). */
  refundableAmount: number;
  onClose: () => void;
  onDone?: () => void;
}

const money = (value: number) => `$${value.toFixed(2)}`;

const getErrorMessage = (error: unknown) => {
  const err = error as {
    data?: { message?: string | string[]; error?: { message?: string } };
  };
  const message = err?.data?.error?.message ?? err?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || "Something went wrong. Please try again.";
};

const CANCEL_OPTIONS: { value: AdminRefundType; label: string; hint: string }[] = [
  {
    value: "POLICY",
    label: "Apply cancellation policy",
    hint: "24h+ before = 100%, under 3h = 70% refund",
  },
  { value: "FULL", label: "Full refund", hint: "Refund everything the customer paid" },
  { value: "PARTIAL", label: "Partial refund", hint: "Refund a custom amount" },
  { value: "NONE", label: "No refund", hint: "Cancel only, keep the payment" },
];

const BookingCancelRefundModal: React.FC<Props> = ({
  isOpen,
  mode,
  bookingId,
  bookingNumber,
  refundableAmount,
  onClose,
  onDone,
}) => {
  const [refundType, setRefundType] = useState<AdminRefundType>(
    mode === "cancel" ? "POLICY" : "FULL",
  );
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [recordNoShow, setRecordNoShow] = useState(false);

  const { data: previewData, isFetching: previewLoading } =
    useGetCancellationPreviewQuery(bookingId ?? "", {
      skip: !isOpen || !bookingId || mode !== "cancel",
    });
  const preview = previewData?.data;

  const [cancelBooking, { isLoading: cancelling }] =
    useAdminCancelBookingMutation();
  const [refundBooking, { isLoading: refunding }] =
    useAdminRefundBookingMutation();
  const busy = cancelling || refunding;

  useEffect(() => {
    if (!isOpen) return;
    setRefundType(mode === "cancel" ? "POLICY" : "FULL");
    setAmount("");
    setReason("");
    setRecordNoShow(false);
  }, [isOpen, mode]);

  const refundable = preview?.paidAmount ?? refundableAmount;

  const refundPreview = useMemo(() => {
    switch (refundType) {
      case "FULL":
        return refundable;
      case "NONE":
        return 0;
      case "PARTIAL":
        return Number(amount) || 0;
      default:
        return preview?.refundAmount ?? 0;
    }
  }, [refundType, refundable, amount, preview]);

  const amountInvalid =
    refundType === "PARTIAL" &&
    (!(Number(amount) > 0) || Number(amount) > refundable + 0.001);
  const canSubmit = Boolean(bookingId) && reason.trim().length > 0 && !amountInvalid && !busy;

  const handleSubmit = async () => {
    if (!bookingId || !canSubmit) return;
    try {
      if (mode === "cancel") {
        await cancelBooking({
          id: bookingId,
          refundType,
          reason: reason.trim(),
          recordGroomerNoShow: recordNoShow,
          ...(refundType === "PARTIAL" && { refundAmount: Number(amount) }),
        }).unwrap();
        toast.success(
          refundPreview > 0
            ? `Booking cancelled and ${money(refundPreview)} refunded`
            : "Booking cancelled",
        );
      } else {
        await refundBooking({
          id: bookingId,
          refundType: refundType === "PARTIAL" ? "PARTIAL" : "FULL",
          reason: reason.trim(),
          ...(refundType === "PARTIAL" && { refundAmount: Number(amount) }),
        }).unwrap();
        toast.success(`${money(refundPreview)} refunded`);
      }
      onDone?.();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const options =
    mode === "cancel"
      ? CANCEL_OPTIONS
      : CANCEL_OPTIONS.filter((o) => o.value === "FULL" || o.value === "PARTIAL");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Inter']">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!busy ? onClose : undefined}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="bg-white rounded-[20px] p-6 sm:p-8 w-full max-w-lg shadow-2xl relative z-10 border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl font-medium tracking-tight text-gray-900">
                  {mode === "cancel" ? "Cancel booking" : "Issue refund"}
                </h3>
                {bookingNumber && (
                  <p className="text-sm text-gray-500 mt-1">{bookingNumber}</p>
                )}
              </div>
              <button
                onClick={onClose}
                disabled={busy}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-4 mb-5 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Refundable balance</span>
                <span className="font-medium text-gray-900">{money(refundable)}</span>
              </div>
              {mode === "cancel" && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Time until appointment</span>
                  <span className="font-medium text-gray-900">
                    {previewLoading
                      ? "…"
                      : preview?.hoursUntilStart == null
                        ? "—"
                        : `${preview.hoursUntilStart.toFixed(1)} h`}
                  </span>
                </div>
              )}
              {mode === "cancel" && preview && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Policy refund</span>
                  <span className="font-medium text-gray-900">
                    {preview.refundPercent}% ({money(preview.refundAmount)})
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-5">
              {options.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    refundType === option.value
                      ? "border-[#FF6B35] bg-[#FFF5F0]"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="refundType"
                    className="mt-1 accent-[#FF6B35]"
                    checked={refundType === option.value}
                    onChange={() => setRefundType(option.value)}
                    disabled={busy}
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                    <span className="block text-xs text-gray-500">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>

            {refundType === "PARTIAL" && (
              <div className="mb-5">
                <label className="block text-xs text-gray-500 mb-1.5">
                  Refund amount (CAD)
                </label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  max={refundable}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={busy}
                  className="w-full bg-[#F5F6F7] rounded-xl p-3 outline-none focus:ring-2 ring-[#FF6B35]/30 text-gray-900"
                  placeholder={`Up to ${money(refundable)}`}
                />
                {amountInvalid && amount !== "" && (
                  <p className="text-xs text-red-600 mt-1">
                    Enter an amount between $0.01 and {money(refundable)}
                  </p>
                )}
              </div>
            )}

            {mode === "cancel" && (
              <label className="flex items-center gap-2 mb-5 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#FF6B35]"
                  checked={recordNoShow}
                  onChange={(e) => setRecordNoShow(e.target.checked)}
                  disabled={busy}
                />
                Record a Groomer No-Show for this booking
              </label>
            )}

            <textarea
              className="w-full h-28 bg-[#F5F6F7] border-none rounded-[15px] p-4 focus:ring-2 ring-[#FF6B35]/20 outline-none resize-none mb-5 text-base placeholder:text-gray-400 text-gray-900"
              placeholder="Reason (visible in the audit log and admin notification)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
            />

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-all w-full text-white ${
                mode === "cancel" ? "bg-red-600" : "bg-[#FF6B35]"
              } ${
                !canSubmit
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90 active:scale-[0.98] cursor-pointer"
              }`}
            >
              {busy ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : mode === "cancel" ? (
                <Ban size={18} />
              ) : (
                <RotateCcw size={18} />
              )}
              <span>
                {busy
                  ? "Processing..."
                  : mode === "cancel"
                    ? `Cancel booking${refundPreview > 0 ? ` & refund ${money(refundPreview)}` : ""}`
                    : `Refund ${money(refundPreview)}`}
              </span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingCancelRefundModal;
