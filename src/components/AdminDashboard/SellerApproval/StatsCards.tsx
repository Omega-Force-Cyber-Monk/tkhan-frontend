import React from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useGetPendingGroomersQuery } from "@/redux/features/groomers/groomersApi";

const StatsCards: React.FC = () => {
  const { data: response, isLoading, error } = useGetPendingGroomersQuery();

  const groomers = response?.data || [];

  const counts = {
    pending: groomers.filter((g) => g.approvalStatus === "PENDING").length,
    approved: groomers.filter((g) => g.approvalStatus === "APPROVED").length,
    rejected: groomers.filter((g) => g.approvalStatus === "REJECTED").length,
  };

  const stats = [
    {
      label: "Pending Review",
      count: counts.pending,
      sub: "Requires action",
      icon: <AlertCircle size={22} />,
      color: "text-[#F54900]",
      countColor: "text-[#F54900]",
      bg: "bg-[#FFF7ED]",
      glow: "hover:shadow-[0_0_20px_rgba(245,73,0,0.15)]",
    },
    {
      label: "Approved",
      count: counts.approved,
      sub: "Active groomers",
      icon: <CheckCircle size={22} />,
      color: "text-[#00A63E]",
      countColor: "text-[#00A63E]",
      bg: "bg-[#F0FDF4]",
      glow: "hover:shadow-[0_0_20px_rgba(0,166,62,0.15)]",
    },
    {
      label: "Rejected",
      count: counts.rejected,
      sub: "Not qualified",
      icon: <XCircle size={22} />,
      color: "text-[#E7000B]",
      countColor: "text-[#E7000B]",
      bg: "bg-[#FEF2F2]",
      glow: "hover:shadow-[0_0_20px_rgba(231,0,11,0.15)]",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
        type: "spring",
        stiffness: 120,
        damping: 12,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-7 md:mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-4 sm:p-5 md:p-6 rounded-[16px] sm:rounded-[18px] md:rounded-[20px] border border-gray-100 shadow-sm animate-pulse"
          >
            <div className="h-3 sm:h-3.5 md:h-4 bg-gray-200 rounded w-20 sm:w-24 md:w-28 mb-3 sm:mb-4"></div>
            <div className="h-7 sm:h-8 md:h-10 bg-gray-200 rounded w-12 sm:w-14 md:w-16 mb-2"></div>
            <div className="h-2 sm:h-2.5 md:h-3 bg-gray-200 rounded w-16 sm:w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Error fetching counts:", error);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-7 md:mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 sm:p-5 md:p-6 rounded-[16px] sm:rounded-[18px] md:rounded-[20px] border border-gray-100 shadow-sm"
          >
            <p className="text-[11px] sm:text-[12px] md:text-[14px] text-gray-600 font-light mb-1 sm:mb-1.5 tracking-tight">
              {item.label}
            </p>
            <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 tracking-tight text-gray-400">
              0
            </h4>
            <p className="text-[10px] sm:text-[11px] md:text-[13px] text-gray-400 font-normal">
              Unable to load
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-7 md:mb-8 font-inter"
    >
      {stats.map((item, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          whileHover={{
            y: -8,
            scale: 1.02,
            transition: { duration: 0.3, type: "spring", stiffness: 300 },
          }}
          whileTap={{ scale: 0.98 }}
          className={`bg-white p-4 sm:p-5 md:p-6 rounded-[16px] sm:rounded-[18px] md:rounded-[20px] border border-gray-100 shadow-sm flex justify-between items-center relative overflow-hidden transition-all duration-300 ${item.glow} group cursor-default`}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />

          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              transform: "skewX(-20deg)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          />

          <div className="relative z-10">
            <motion.p
              className="text-[11px] sm:text-[12px] md:text-[14px] whitespace-nowrap text-gray-600 font-light mb-1 sm:mb-1.5 tracking-tight"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              {item.label}
            </motion.p>

            <motion.h4
              key={item.count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2 + index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 10,
              }}
              className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${item.countColor}`}
            >
              {item.count}
            </motion.h4>

            <motion.p
              className="text-[9px] sm:text-[10px] md:text-[13px] whitespace-nowrap text-gray-400 font-normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              {item.sub}
            </motion.p>
          </div>

          <div
            className={`p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl ${item.bg} ${item.color} relative z-10`}
          >
            {item.icon}
          </div>

          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${item.countColor.replace(
              "text-",
              "from-",
            )} to-transparent`}
            initial={{ width: "0%" }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCards;
