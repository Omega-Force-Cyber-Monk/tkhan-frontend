import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, ShieldCheck, Home } from "lucide-react";
import { motion } from "framer-motion";

const OnboardingSuccess: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center relative overflow-hidden"
      >
        {/* Subtle decorative background blur */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

        {/* Success Icon */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
          Onboarding Successful!
        </h1>

        <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
          Your Stripe Connect account has been successfully linked. You are now
          set up to receive direct payouts and manage your earnings securely.
        </p>

        {/* Feature badge / note */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gray-50 border border-gray-200/80 px-4 py-3 text-xs sm:text-sm text-gray-700">
          <ShieldCheck className="h-5 w-5 text-[#FF6B35] shrink-0" />
          <span>Payment details verified and secured by Stripe</span>
        </div>


        {/* Brand footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Karoot • Stripe Connect Integration
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingSuccess;

