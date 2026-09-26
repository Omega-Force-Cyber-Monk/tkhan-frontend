import React from "react";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import type { ServiceReviewItem } from "@/redux/features/booking/bookingTypes";

interface Props {
  review: ServiceReviewItem;
  onBack: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  actingId?: string | null;
}

const PhotoPanel: React.FC<{ src: string; label: string }> = ({ src, label }) => (
  <div>
    <h4 className="text-sm font-medium text-gray-700 mb-2">{label}</h4>
    {src ? (
      <img
        src={src}
        alt={label}
        className="w-full h-[360px] object-cover rounded-lg"
      />
    ) : (
      <div className="w-full h-[360px] rounded-lg bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <ImageOff size={28} />
        <span className="text-sm mt-2">No {label.toLowerCase()} photo</span>
      </div>
    )}
  </div>
);

const ReviewDetails: React.FC<Props> = ({
  review,
  onBack,
  onAccept,
  onReject,
  actingId,
}) => {
  if (!review) return null;

  const busy = actingId === review.id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {review.service}
          </h2>
          <p className="text-sm text-gray-500">by {review.groomer}</p>
          {review.bookingNumber && (
            <p className="text-xs text-gray-400 mt-0.5">{review.bookingNumber}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            Back
          </button>
          <div
            className={`text-sm font-semibold px-3 py-1 rounded-full text-white capitalize ${
              review.status === "pending"
                ? "bg-yellow-500"
                : review.status === "accepted"
                  ? "bg-green-500"
                  : "bg-red-500"
            }`}
          >
            {review.canReview ? "Pending" : review.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PhotoPanel src={review.beforeImg} label="Before" />
        <PhotoPanel src={review.afterImg} label="After" />
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700">Notes</h4>
        <p className="text-gray-600 mt-2">{review.reviewText}</p>
      </div>

      {review.canReview && (
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => onAccept(review.id)}
            disabled={busy}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer disabled:opacity-50"
          >
            {busy ? "Saving..." : "Accept"}
          </button>
          <button
            onClick={() => onReject(review.id)}
            disabled={busy}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ReviewDetails;
