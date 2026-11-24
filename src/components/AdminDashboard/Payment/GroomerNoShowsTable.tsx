import React from "react";
import { toast } from "sonner";
import {
  GroomerNoShow,
  useGetGroomerNoShowsQuery,
  useLiftGroomerSuspensionMutation,
} from "../../../redux/features/booking/cancellationApi";

const actionStyle: Record<GroomerNoShow["actionTaken"], string> = {
  NONE: "bg-gray-100 text-gray-700",
  WARNING: "bg-amber-100 text-amber-800",
  SUSPENSION: "bg-orange-100 text-orange-800",
  BLOCK: "bg-red-100 text-red-800",
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

export const GroomerNoShowsTable: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetGroomerNoShowsQuery();
  const [liftSuspension, { isLoading: lifting }] =
    useLiftGroomerSuspensionMutation();
  const rows = data?.data ?? [];

  const handleLift = async (row: GroomerNoShow) => {
    try {
      await liftSuspension(row.groomerProfile.id).unwrap();
      toast.success(`Suspension lifted for ${row.groomerProfile.user.fullName}`);
      refetch();
    } catch {
      toast.error("Could not lift the suspension. Please try again.");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500 p-6">Loading no-shows…</p>;
  }
  if (isError) {
    return <p className="text-sm text-red-600 p-6">Could not load groomer no-shows.</p>;
  }
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center text-sm text-gray-500">
        No groomer No-Shows recorded yet. Late groomer cancellations (under 24h)
        will appear here.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#F9FAFB] text-[#6B7280] text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Groomer</th>
            <th className="px-4 py-3 font-medium">Booking</th>
            <th className="px-4 py-3 font-medium">Hours before start</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Total No-Shows</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const suspended =
              row.groomerProfile.suspendedUntil &&
              new Date(row.groomerProfile.suspendedUntil) > new Date();
            return (
              <tr key={row.id} className="border-t border-[#F3F4F6]">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">
                    {row.groomerProfile.user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{row.groomerProfile.user.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{row.booking.bookingNumber}</td>
                <td className="px-4 py-3 text-gray-700">
                  {Number(row.hoursBeforeStart).toFixed(1)} h
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${actionStyle[row.actionTaken]}`}>
                    {row.actionTaken}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{row.groomerProfile.noShowCount}</td>
                <td className="px-4 py-3 text-gray-700">
                  {row.groomerProfile.user.isBlocked
                    ? "Blocked"
                    : suspended
                      ? `Suspended until ${formatDate(row.groomerProfile.suspendedUntil)}`
                      : "Active"}
                </td>
                <td className="px-4 py-3 text-gray-700">{formatDate(row.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  {suspended && (
                    <button
                      onClick={() => handleLift(row)}
                      disabled={lifting}
                      className="text-xs font-medium text-[#FF6B35] hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      Lift suspension
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GroomerNoShowsTable;
