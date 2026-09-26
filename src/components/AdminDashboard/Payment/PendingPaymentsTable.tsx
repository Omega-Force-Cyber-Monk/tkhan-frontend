import { useMemo, useState } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Payment } from "../../../redux/features/payment/paymentTypes";
import { useGetPaymentsQuery } from "../../../redux/features/payment/paymentApi";

interface PendingPaymentsTableProps {
  onViewDetails: (payment: Payment) => void;
}

export const isPendingCompletion = (payment: Payment): boolean => {
  const booking = payment.booking;
  if (!booking) return false;

  return (
    booking.status === "COMPLETION_REQUESTED" ||
    Boolean(booking.completionRequestedAt && !booking.completedAt)
  );
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

export const PendingPaymentsTable = ({
  onViewDetails,
}: PendingPaymentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading, isError } = useGetPaymentsQuery();

  const pendingPayments = useMemo(() => {
    const payments = data?.data ?? [];
    return payments.filter(isPendingCompletion);
  }, [data]);

  const filteredPayments = pendingPayments.filter((payment) => {
    const q = searchTerm.toLowerCase();
    return (
      payment.id.toLowerCase().includes(q) ||
      payment.booking?.bookingNumber?.toLowerCase().includes(q) ||
      payment.bookingId.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-[#E3E3E4] font-['Inter']">
      <div className="p-3 md:p-4 lg:p-6 border-b border-gray-200">
        <div className="relative w-full max-w-[500px]">
          <Search
            size={18}
            className="absolute inset-y-0 left-4 my-auto text-[#94A3B8]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search pending completions..."
            className="w-full pl-11 pr-4 py-2 md:py-3 bg-[#F8FAFC] border border-[#E3E3E4] rounded-xl text-[12px] md:text-[13px] text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-all"
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto overflow-y-hidden bg-white">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="border-b border-[#DBE0E5] bg-gray-50">
            <tr>
              {[
                "Booking Reference",
                "Amount",
                "Requested",
                "Status",
                "Actions",
              ].map((head) => (
                <th
                  key={head}
                  className={`px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-[11px] font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap ${
                    head === "Actions" ? "text-center" : "text-left"
                  }`}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 size={20} className="animate-spin" />
                    Loading pending payments...
                  </div>
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400">
                    <AlertCircle size={20} />
                    Failed to load pending payments.
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && filteredPayments.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-16 text-center text-gray-400 italic"
                >
                  {searchTerm
                    ? `No results for "${searchTerm}"`
                    : "No pending completions right now."}
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              currentPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-orange-50/40 transition-colors"
                >
                  <td className="px-4 md:px-6 py-4 md:py-5 text-[#1E293B] font-medium text-[13px]">
                    {payment.booking?.bookingNumber ?? "—"}
                  </td>
                  <td className="px-4 md:px-6 py-4 md:py-5 font-bold text-[#1E293B] text-[13px]">
                    ${payment.amount} {payment.currency?.toUpperCase()}
                  </td>
                  <td className="px-4 md:px-6 py-4 md:py-5 text-gray-600 text-[13px]">
                    {formatDate(payment.booking?.completionRequestedAt)}
                  </td>
                  <td className="px-4 md:px-6 py-4 md:py-5">
                    <span className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#FEF3C7] text-[#D97706]">
                      Completion pending
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 md:py-5 text-center">
                    <button
                      onClick={() => onViewDetails(payment)}
                      className="px-3 py-1.5 rounded-lg text-[#1E293B] font-medium text-[12px] hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && filteredPayments.length > 0 && (
        <div className="flex items-center justify-between p-4 px-6">
          <p className="text-[13px] text-[#64748B]">
            Showing {startIndex + 1}–
            {Math.min(endIndex, filteredPayments.length)} of{" "}
            {filteredPayments.length} pending
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E3E3E4] disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E3E3E4] disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
