import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, XCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const CompletionRejectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

  const busy = isLoading;

  const handleConfirm = async () => {
    if (!reason.trim() || busy) return;
    await onConfirm(reason.trim());
  };

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
            className="bg-white rounded-[20px] p-6 sm:p-8 w-full max-w-lg shadow-2xl relative z-10 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium tracking-tight text-gray-900">
                Reject completion
              </h3>
              <button
                onClick={onClose}
                disabled={busy}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            <textarea
              className="w-full h-36 bg-[#F5F6F7] border-none rounded-[15px] p-4 focus:ring-2 ring-red-500/20 outline-none resize-none mb-6 text-base placeholder:text-gray-400 text-gray-900"
              placeholder="Enter a reason for rejecting this completion request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
            />

            <button
              onClick={handleConfirm}
              disabled={!reason.trim() || busy}
              className={`bg-red-600 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-all w-full text-white ${
                !reason.trim() || busy
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-red-700 active:scale-[0.98] cursor-pointer"
              }`}
            >
              {busy ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <XCircle size={20} />
              )}
              <span>{busy ? "Rejecting..." : "Reject completion"}</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CompletionRejectModal;
