import { motion } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";
import { Payment } from "../../../redux/features/payment/paymentTypes";

interface PaymentDetailsProps {
  onBack: () => void;
  data: Payment | null;
  onAcceptCompletion?: (bookingId: string) => void;
  onRejectCompletion?: (bookingId: string) => void;
  actingId?: string | null;
  showCompletionActions?: boolean;
}

type PaymentStatus = "SUCCEEDED" | "PENDING" | "FAILED" | "REFUNDED";

interface StatusStyle {
  bg: string;
  text: string;
  label: string;
}

const statusConfig: Record<PaymentStatus, StatusStyle> = {
  SUCCEEDED: { bg: "bg-green-100", text: "text-green-800", label: "Paid" },
  PENDING: { bg: "bg-amber-100", text: "text-amber-800", label: "Pending" },
  FAILED: { bg: "bg-red-100", text: "text-red-800", label: "Failed" },
  REFUNDED: { bg: "bg-blue-100", text: "text-blue-800", label: "Refunded" },
};

const convertToNumber = (value: string | number | undefined): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  return 0;
};

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  onBack,
  data,
  onAcceptCompletion,
  onRejectCompletion,
  actingId,
  showCompletionActions = false,
}) => {
  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 text-sm">No payment data available.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const statusStyle: StatusStyle =
    statusConfig[data.status as PaymentStatus] ?? statusConfig["PENDING"];
  const numericAmount = convertToNumber(data.amount);
  const booking = data.booking;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="font-['Inter',_sans-serif] w-full max-w-[720px]"
    >
      <div className="mb-5">
        <button
          onClick={onBack}
          className="text-[#6B7280] hover:text-[#111827] transition-colors p-0.5 -ml-0.5 mb-2"
        >
          <ArrowLeft size={18} className="cursor-pointer" />
        </button>
        <h1 className="text-[19px] font-medium text-[#111827]">
          Payment Details
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-[14px] font-medium text-[#111827]">
            Payment Details
          </span>
          <button
            onClick={onBack}
            className="text-[#9CA3AF] hover:text-[#111827] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="h-px bg-[#F3F4F6]" />

        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] text-[#9CA3AF] mb-1">Transaction ID</p>
              <p className="text-[14px] font-medium text-[#111827]">
                {data.id}
              </p>
            </div>
            <span
              className={`text-[11px] font-medium px-2.5 py-[3px] rounded-full ${statusStyle.bg} ${statusStyle.text}`}
            >
              {statusStyle.label}
            </span>
          </div>

          <div className="bg-[#F9FAFB] rounded-xl border border-[#F3F4F6] overflow-hidden">
            <div className="px-6 py-6">
              <p className="text-[11px] text-[#9CA3AF] mb-1.5">Amount</p>
              <p className="text-[34px] font-bold text-[#111827] tracking-tight">
                ${numericAmount.toFixed(0)}
              </p>
            </div>

            <div className="h-px bg-[#E5E7EB]" />

            <div className="px-6 py-6 grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-[11px] text-[#9CA3AF] mb-1">
                  Booking Reference
                </p>
                <p className="text-[13px] font-medium text-[#111827]">
                  {booking?.bookingNumber ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#9CA3AF] mb-1">
                  Payment Method
                </p>
                <p className="text-[13px] font-medium text-[#111827]">
                  Credit Card
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#9CA3AF] mb-1">Date</p>
                <p className="text-[13px] font-medium text-[#111827]">
                  {data.paidAt
                    ? new Date(data.paidAt).toISOString().split("T")[0]
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#9CA3AF] mb-1">Status</p>
                <span
                  className={`text-[11px] font-medium px-[9px] py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {statusStyle.label}
                </span>
              </div>
            </div>
          </div>

          {(booking?.beforeImage ||
            booking?.afterImage ||
            booking?.completionNote) && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-[#9CA3AF] mb-1">
                  Completion note
                </p>
                <p className="text-[13px] text-[#111827]">
                  {booking?.completionNote || "No note provided."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-[#9CA3AF] mb-1.5">Before</p>
                  {booking?.beforeImage ? (
                    <img
                      src={booking.beforeImage}
                      alt="Before"
                      className="w-full h-36 object-cover rounded-xl border border-[#F3F4F6]"
                    />
                  ) : (
                    <div className="w-full h-36 rounded-xl bg-[#F9FAFB] border border-dashed border-[#E5E7EB] text-[#9CA3AF] text-xs flex items-center justify-center">
                      No before photo
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF] mb-1.5">After</p>
                  {booking?.afterImage ? (
                    <img
                      src={booking.afterImage}
                      alt="After"
                      className="w-full h-36 object-cover rounded-xl border border-[#F3F4F6]"
                    />
                  ) : (
                    <div className="w-full h-36 rounded-xl bg-[#F9FAFB] border border-dashed border-[#E5E7EB] text-[#9CA3AF] text-xs flex items-center justify-center">
                      No after photo
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {showCompletionActions && booking && (
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => onAcceptCompletion?.(booking.id)}
                disabled={actingId === booking.id}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-[13px] font-medium hover:bg-green-700 disabled:opacity-50 cursor-pointer"
              >
                {actingId === booking.id ? "Saving..." : "Accept completion"}
              </button>
              <button
                onClick={() => onRejectCompletion?.(booking.id)}
                disabled={actingId === booking.id}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                Reject completion
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
