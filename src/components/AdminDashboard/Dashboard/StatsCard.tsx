import React, { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  children?: React.ReactNode;
}

const StatsCardComponent: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
}) => {
  const [count, setCount] = useState(0);
  const numericValue =
    typeof value === "number" ? value : parseFloat(value as string) || 0;

  useEffect(() => {
    if (typeof value === "number") {
      let start = 0;
      const duration = 1000;
      const increment = numericValue / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    } else {
      setCount(numericValue);
    }
  }, [numericValue, value]);

  const displayValue =
    typeof value === "number" ? count.toLocaleString() : value;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{
        boxShadow: "0 20px 40px -12px rgba(255, 107, 53, 0.2)",
        borderColor: "rgba(255, 107, 53, 0.3)",
      }}
      transition={{
        duration: 0.35,
        ease: [0.23, 1, 0.32, 1],
      }}
      className="group bg-white p-4 sm:p-5 md:p-6 lg:p-8 rounded-[16px] sm:rounded-[18px] md:rounded-[20px] border border-gray-100 flex items-center justify-between shadow-sm font-inter w-full min-w-0 h-full relative overflow-hidden transition-colors hover:bg-gradient-to-br hover:from-white hover:to-[#FFF4EF]/30"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/0 to-[#FF6B35]/0 rounded-[20px]"
        whileHover={{
          background:
            "linear-gradient(135deg, rgba(255,107,53,0.05) 0%, rgba(255,107,53,0.02) 100%)",
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="flex flex-col gap-1 sm:gap-1.5 overflow-hidden relative z-10 min-w-0 flex-1">
        <motion.p
          className="text-gray-400 text-[11px] sm:text-[12px] md:text-[13px] lg:text-[15px] font-medium tracking-tight truncate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.p>

        <motion.h3
          className="text-[20px] sm:text-[22px] md:text-[24px] lg:text-[32px] font-bold text-black leading-tight whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {displayValue}
        </motion.h3>

        {trend && (
          <motion.div
            className="flex items-center gap-1 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span
              className={`text-[9px] sm:text-[10px] md:text-[11px] font-medium whitespace-nowrap ${trend.isPositive ? "text-green-500" : "text-red-500"}`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-400 whitespace-nowrap">
              vs last month
            </span>
          </motion.div>
        )}
      </div>

      <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-xl sm:rounded-2xl flex items-center justify-center bg-[#FFF4EF] text-[#FF6B35] shrink-0 ml-3 sm:ml-4 group-hover:bg-[#FF6B35] group-hover:text-white transition-colors duration-300">
        <Icon
          className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6"
          strokeWidth={2.5}
        />
      </div>

      <motion.div
        className="absolute -bottom-2 -right-2 w-20 h-20 sm:w-24 sm:h-24 bg-[#FF6B35]/5 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          transform: "skewX(-20deg)",
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />
    </motion.div>
  );
};

export const StatsGrid: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="mb-6 sm:mb-7 md:mb-8 w-full">
      <div
        className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
        }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export { StatsCardComponent as StatsCard };
