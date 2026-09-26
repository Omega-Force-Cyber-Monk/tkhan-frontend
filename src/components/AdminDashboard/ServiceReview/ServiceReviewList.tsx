import React from "react";
import { motion } from "framer-motion";
import { Eye, ImageOff } from "lucide-react";
import type { ServiceReviewItem } from "@/redux/features/booking/bookingTypes";

interface Props {
  reviews: ServiceReviewItem[];
  onSelect: (r: ServiceReviewItem) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  actingId?: string | null;
}

const PhotoSlot: React.FC<{ src: string; label: string; onClick: () => void }> = ({
  src,
  label,
  onClick,
}) => {
  if (!src) {
    return (
      <div className="w-full h-28 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <ImageOff size={18} />
        <span className="text-[11px] mt-1 capitalize">{label} photo</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      <img
        src={src}
        alt={label}
        className="w-full h-28 object-cover rounded-lg cursor-pointer"
        onClick={onClick}
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-black/30 p-2 rounded-full">
          <Eye size={18} color="#fff" />
        </div>
      </div>
    </div>
  );
};

const ServiceReviewList: React.FC<Props> = ({
  reviews,
  onSelect,
  onAccept,
  onReject,
  actingId,
}) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center text-gray-500">
        No booking details to review yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reviews.map((r) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-4 rounded-2xl border border-gray-100"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-lg truncate">
                {r.service}
              </h3>
              <p className="text-sm text-gray-500">by {r.groomer}</p>
              {r.bookingNumber && (
                <p className="text-xs text-gray-400 mt-0.5">{r.bookingNumber}</p>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2">
                <PhotoSlot
                  src={r.beforeImg}
                  label="before"
                  onClick={() => onSelect(r)}
                />
                <PhotoSlot
                  src={r.afterImg}
                  label="after"
                  onClick={() => onSelect(r)}
                />
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <div
                className={`text-sm font-semibold px-3 py-1 rounded-full text-white capitalize ${
                  r.status === "pending"
                    ? "bg-yellow-500"
                    : r.status === "accepted"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              >
                {r.canReview ? "Pending" : r.status}
              </div>

              <div className="flex flex-col gap-2">
                {r.canReview && (
                  <>
                    <button
                      onClick={() => onAccept(r.id)}
                      disabled={actingId === r.id}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 cursor-pointer disabled:opacity-50"
                    >
                      {actingId === r.id ? "Saving..." : "Accept"}
                    </button>
                    <button
                      onClick={() => onReject(r.id)}
                      disabled={actingId === r.id}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => onSelect(r)}
                  className="text-sm text-[#FF6B35] underline hover:no-underline cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ServiceReviewList;
