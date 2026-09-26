import React, { useEffect, useState } from "react";
import {
  LayoutGrid,
  Users,
  CheckCircle,
  CreditCard,
  HelpCircle,
  Star,
  LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { useCurrentUser } from "@/redux/features/auth/authSlice";
import { useGetMeQuery } from "@/redux/features/users/usersApi";
import { useAppSelector } from "@/redux/hooks/redux-hook";
import {
  PROFILE_PIC_UPDATED,
  readSavedProfileImage,
} from "@/utils/adminProfilePic";

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export interface SidebarProps {
  onItemClick?: () => void;
  userImage?: string;
  userName?: string;
  userEmail?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    icon: LayoutGrid,
    label: "Dashboard",
    href: "/admin-dashboard/dashboard",
  },
  {
    icon: Users,
    label: "Users",
    href: "/admin-dashboard/users",
  },
  {
    icon: CheckCircle,
    label: "Seller Approval",
    href: "/admin-dashboard/seller-approval",
  },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/admin-dashboard/payments",
  },
  {
    icon: HelpCircle,
    label: "Support",
    href: "/admin-dashboard/support",
  },
  {
    icon: Star,
    label: "Service Review",
    href: "/admin-dashboard/service-review",
  },
];

const AdminSidebar: React.FC<SidebarProps> = ({
  onItemClick,
  userImage,
  userName = "Admin User",
  userEmail = "admin@platform.com",
}) => {
  const location = useLocation();
  const user = useAppSelector(useCurrentUser);
  const { data: meResponse } = useGetMeQuery();
  const me = meResponse?.data;
  const displayName = me?.fullName || user?.fullName || userName;
  const displayEmail = me?.email || user?.email || userEmail;
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    const onUpdate = (event: Event) => {
      const nextPic = (event as CustomEvent<string>).detail;
      if (nextPic?.startsWith("http")) setUploadedImage(nextPic);
    };

    window.addEventListener(PROFILE_PIC_UPDATED, onUpdate);
    return () => window.removeEventListener(PROFILE_PIC_UPDATED, onUpdate);
  }, []);

  const avatar =
    uploadedImage ||
    readSavedProfileImage(me?.id || user?.id) ||
    me?.profileImage ||
    (user?.profileImage?.startsWith("http") ? user.profileImage : null) ||
    userImage;

  const sidebarVariants: Variants = {
    hidden: { opacity: 0, x: -15 },

    visible: {
      opacity: 1,
      x: 0,

      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="flex flex-col bg-white border-r border-gray-100 font-inter w-full h-full overflow-y-auto"
      style={{ boxShadow: "4px 0px 15px rgba(0,0,0,0.03)" }}
    >
      <div className="p-5 sm:p-6 md:p-8 mb-2 shrink-0">
        <Link to="/admin-dashboard/dashboard">
          <div className="flex flex-col items-start">
            <h1 className="text-[#FF6B35] text-[22px] sm:text-[25px] md:text-[28px] font-semibold tracking-tight leading-none">
              Karoot
            </h1>

            <p className="text-[11px] sm:text-[12px] md:text-[13px] font-semibold text-gray-700 mt-1 tracking-wider">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-2 sm:px-3 md:px-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href === "/admin-dashboard/dashboard" &&
              location.pathname === "/admin-dashboard");

          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.href}
              onClick={onItemClick}
              className="relative block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "text-[#FF6B35] bg-[#FFEDE6]"
                    : "text-gray-700 hover:bg-[#FF6B35]/5 hover:text-[#FF6B35]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#FF6B35] rounded-l-full"
                  />
                )}

                <Icon
                  size={16}
                  className={`sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 ${
                    isActive
                      ? "text-[#FF6B35] cursor-pointer"
                      : "text-gray-800 group-hover:text-[#FF6B35] cursor-pointer"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                <span className="text-[13px] sm:text-[14px] md:text-[15px] font-medium">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0">
        <hr className="border-gray-100 mx-4 sm:mx-5 md:mx-6" />

        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 bg-gray-50/50 p-3 sm:p-4 rounded-2xl">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] text-sm sm:text-base font-bold overflow-hidden border border-[#FF6B35]/20 shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                displayName.charAt(0)
              )}
            </div>

            <div className="overflow-hidden text-left">
              <p className="text-[12px] sm:text-[13px] md:text-sm font-medium text-gray-800 truncate">
                {displayName}
              </p>

              <p className="text-[10px] sm:text-[10.5px] md:text-[11px] text-gray-400 truncate">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;
