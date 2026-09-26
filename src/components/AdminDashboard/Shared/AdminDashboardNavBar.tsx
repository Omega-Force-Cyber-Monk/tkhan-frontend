import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Bell,
  Menu,
  LogOut,
  ImagePlus,
  CheckCircle,
  Info,
  BellOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import userIcon from "@/assets/icons/user.svg";
import { useDispatch } from "react-redux";
import { logOut, setProfileImage, useCurrentUser } from "@/redux/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks/redux-hook";
import { useGetMeQuery, useUpdateProfileImageMutation } from "@/redux/features/users/usersApi";
import { readSavedProfileImage, saveAdminProfilePic } from "@/utils/adminProfilePic";
import { toast } from "sonner";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/redux/features/notification/notificationApi";
import type { Notification } from "@/redux/features/notification/notificationTypes";

export interface NavbarProps {
  onMobileMenuToggle: () => void;
  userName?: string;
  isSidebarOpen: boolean;
}

const POLLING_INTERVAL = 30000;
const PAGE_LIMIT = 20;

const getTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

const DIRECT_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const toProfileImageFile = async (file: File): Promise<File> => {
  const isSvg = file.name.toLowerCase().endsWith(".svg");
  if (DIRECT_IMAGE_TYPES.has(file.type) || isSvg) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Please choose a JPG, PNG, or SVG image.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Please choose a JPG, PNG, or SVG image.");
  }
  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (!blob) throw new Error("Please choose a JPG, PNG, or SVG image.");
  return new File([blob], "profile.png", { type: "image/png" });
};

const getUploadError = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as {
      data?: { message?: string | string[]; error?: { message?: string } } | string;
    }).data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object") {
      const message = data.error?.message || (Array.isArray(data.message) ? data.message.join(", ") : data.message);
      if (message === "Only image files are allowed") {
        return "Please choose a JPG, PNG, or SVG image.";
      }
      if (message === "Internal server error") {
        return "The server couldn't save this image. Try a smaller JPG or PNG.";
      }
      if (message) return message;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Could not update profile picture.";
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "BOOKING_ACCEPTED":
    case "BOOKING_COMPLETED":
    case "PAYMENT_SUCCESS":
    case "GROOMER_APPROVED":
      return <CheckCircle size={14} />;
    default:
      return <Info size={14} />;
  }
};

const AdminDashboardNavBar: React.FC<NavbarProps> = ({
  onMobileMenuToggle,
  userName = "Admin",
}) => {
  const dispatch = useDispatch();
  const user = useAppSelector(useCurrentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [profilePic, setProfilePic] = useState<string>(userIcon);
  const [optimisticReadIds, setOptimisticReadIds] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();
  const [updateProfileImage, { isLoading: isUploadingPic }] =
    useUpdateProfileImageMutation();
  const { data: meResponse } = useGetMeQuery();
  const me = meResponse?.data;
  const displayName = me?.fullName || user?.fullName || userName;
  const displayEmail = me?.email || user?.email || "";
  const savedImage = readSavedProfileImage(me?.id || user?.id);
  const accountImage =
    savedImage ||
    me?.profileImage ||
    (user?.profileImage?.startsWith("http") ? user.profileImage : null);
  const profileSrc = profilePic.startsWith("blob:") ? profilePic : accountImage || userIcon;

  useEffect(() => {
    if (savedImage || !me?.profileImage) return;
    dispatch(setProfileImage(me.profileImage));
    void saveAdminProfilePic(me.id, me.profileImage);
  }, [dispatch, me?.id, me?.profileImage, savedImage]);

  const {
    data: page1Data,
    isLoading,
    isFetching: isFetchingPage1,
  } = useGetNotificationsQuery(
    { page: 1, limit: PAGE_LIMIT, sortBy: "createdAt", sortOrder: "desc" },
    {
      pollingInterval: POLLING_INTERVAL,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );

  const { data: extraPageData, isFetching: isFetchingExtra } =
    useGetNotificationsQuery(
      {
        page: currentPage,
        limit: PAGE_LIMIT,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      {
        skip: currentPage === 1,
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
      },
    );

  useEffect(() => {
    if (page1Data?.data?.items) {
      const items = page1Data.data.items;
      const meta = page1Data.data.meta;

      setAllNotifications((prev) => {
        const restPages = prev.slice(PAGE_LIMIT);
        const merged = [...items, ...restPages];
        const seen = new Set<string>();
        return merged.filter((n) => {
          if (seen.has(n.id)) return false;
          seen.add(n.id);
          return true;
        });
      });

      setHasMore(meta.page < meta.totalPages);

      setOptimisticReadIds((prev) => {
        if (prev.size === 0) return prev;
        const next = new Set(prev);
        items.forEach((n: Notification) => {
          if (n.readAt !== null) next.delete(n.id);
        });
        return next;
      });
    }
  }, [page1Data]);

  useEffect(() => {
    if (extraPageData?.data?.items && currentPage > 1) {
      const items = extraPageData.data.items;
      const meta = extraPageData.data.meta;

      setAllNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const unique = items.filter(
          (n: Notification) => !existingIds.has(n.id),
        );
        return [...prev, ...unique];
      });

      setHasMore(meta.page < meta.totalPages);
    }
  }, [extraPageData, currentPage]);

  useEffect(() => {
    if (!isNotifOpen) {
      setCurrentPage(1);
    }
  }, [isNotifOpen]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (isNotifOpen && !notifRef.current?.contains(target)) {
        setIsNotifOpen(false);
      }
      if (isProfileOpen && !profileRef.current?.contains(target)) {
        setIsProfileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isNotifOpen, isProfileOpen]);

  const displayNotifications = allNotifications.map((notif) => {
    if (optimisticReadIds.has(notif.id)) {
      return { ...notif, readAt: notif.readAt ?? new Date().toISOString() };
    }
    return notif;
  });

  const unreadCount = displayNotifications.filter(
    (n) => n.readAt === null,
  ).length;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (
      !el ||
      isFetchingExtra ||
      !hasMore ||
      currentPage >= (page1Data?.data?.meta?.totalPages ?? 1)
    )
      return;

    const nearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 60;
    if (nearBottom) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isFetchingExtra, hasMore, currentPage, page1Data]);

  const handleSignOut = () => dispatch(logOut());

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const allIds = displayNotifications
      .filter((n) => n.readAt === null)
      .map((n) => n.id);
    setOptimisticReadIds(new Set(allIds));

    try {
      await markAllRead().unwrap();
      setAllNotifications((prev) =>
        prev.map((n) =>
          n.readAt === null ? { ...n, readAt: new Date().toISOString() } : n,
        ),
      );
      setOptimisticReadIds(new Set());
    } catch (err) {
      setOptimisticReadIds(new Set());
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleMarkOneRead = async (
    notification: Notification,
    e: React.MouseEvent,
  ) => {
    if (notification.readAt !== null) return;
    e.preventDefault();
    e.stopPropagation();

    setOptimisticReadIds((prev) => {
      const next = new Set(prev);
      next.add(notification.id);
      return next;
    });

    try {
      await markRead(notification.id).unwrap();
      setAllNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, readAt: new Date().toISOString() }
            : n,
        ),
      );
      setOptimisticReadIds((prev) => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    } catch (err) {
      setOptimisticReadIds((prev) => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isUploadingPic) return;

    const previousPic = profilePic;
    const previewUrl = URL.createObjectURL(file);
    setProfilePic(previewUrl);

    try {
      const uploadFile = await toProfileImageFile(file);
      const result = await updateProfileImage(uploadFile).unwrap();
      const imageUrl = result.data?.profileImage;
      if (!imageUrl) {
        throw new Error("Profile image URL was not returned.");
      }

      setProfilePic(imageUrl);
      dispatch(setProfileImage(imageUrl));
      await saveAdminProfilePic(user?.id, imageUrl);
      toast.success("Profile picture updated");
    } catch (error: unknown) {
      setProfilePic(previousPic);
      toast.error(getUploadError(error));
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="bg-white border-b border-[#F3F4F6]">
      <header className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6 lg:px-8 w-full overflow-visible">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-black cursor-pointer w-8 h-8 sm:w-9 sm:h-9"
            onClick={onMobileMenuToggle}
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 mr-5 sm:mr-10 md:mr-2 lg:mr-[72px]">
          <div ref={notifRef} className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={isNotifOpen}
              onClick={() => {
                setIsNotifOpen((open) => !open);
                setIsProfileOpen(false);
              }}
              className="p-2 sm:p-2.5 md:p-3 bg-[#FF6B35] rounded-lg sm:rounded-xl text-white relative cursor-pointer shadow-sm outline-none"
            >
              <Bell
                size={16}
                className={`sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 transition-opacity ${
                  isFetchingPage1 ? "opacity-60" : "opacity-100"
                }`}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full border-2 border-white shadow-sm">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 md:w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 p-2 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-[#FF6B35]/10 text-[#FF6B35] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      disabled={isMarkingAll}
                      className="text-[11px] text-[#FF6B35] hover:underline font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      {isMarkingAll ? "Marking..." : "Mark all read"}
                    </button>
                  )}
                </div>

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="max-h-[380px] overflow-y-auto overscroll-contain
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-gray-200
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : displayNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                      <BellOff size={28} />
                      <span className="text-sm">No notifications</span>
                    </div>
                  ) : (
                    <>
                      {displayNotifications.map((notif) => (
                        <button
                          type="button"
                          key={notif.id}
                          onClick={(e) => handleMarkOneRead(notif, e)}
                          className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl cursor-pointer transition-colors w-full text-left mb-1 ${
                            notif.readAt === null
                              ? "bg-[#FF6B35]/5 hover:bg-[#FF6B35]/10"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-[#FF6B35] shrink-0">
                              {getNotificationIcon(notif.type)}
                            </span>
                            <span className="text-[13px] font-semibold text-gray-800 flex-1 leading-snug">
                              {notif.title}
                            </span>
                            {notif.readAt === null && (
                              <span className="w-2 h-2 rounded-full bg-[#FF6B35] shrink-0" />
                            )}
                          </div>
                          <p className="text-[12px] text-gray-500 pl-6 leading-snug line-clamp-2">
                            {notif.body}
                          </p>
                          <span className="text-[10px] text-gray-400 pl-6 mt-0.5">
                            {getTimeAgo(notif.createdAt)}
                          </span>
                        </button>
                      ))}

                      {isFetchingExtra && (
                        <div className="flex items-center justify-center py-4 text-gray-400 gap-2">
                          <Loader2 size={14} className="animate-spin" />
                          <span className="text-xs">Loading more...</span>
                        </div>
                      )}

                      {!hasMore && displayNotifications.length > 0 && (
                        <p className="text-center text-[11px] text-gray-300 py-3">
                          You're all caught up!
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="p-2 border-t border-gray-50">
                  {isFetchingPage1 && !isLoading && (
                    <div className="flex items-center justify-center gap-1 pb-1">
                      <Loader2 size={10} className="animate-spin text-gray-300" />
                      <span className="text-[10px] text-gray-300">
                        Updating...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-10 w-[1.5px] bg-gray-200 mx-1 hidden md:block" />

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-label="Profile menu"
                aria-expanded={isProfileOpen}
                onClick={() => {
                  setIsProfileOpen((open) => !open);
                  setIsNotifOpen(false);
                }}
                className="relative group cursor-pointer outline-none rounded-full"
              >
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-50">
                  <img
                    src={profileSrc}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                  {isUploadingPic && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 size={16} className="animate-spin text-white" />
                    </span>
                  )}
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-[#FF6B35] text-white w-56 shadow-2xl rounded-2xl border border-white/20 p-2">
                  <button
                    type="button"
                    disabled={isUploadingPic}
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left hover:bg-white hover:text-[#FF6B35] transition-all cursor-pointer mb-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ImagePlus size={18} />
                    <span className="font-medium">Set your picture</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left bg-black/10 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span className="font-bold">Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            <div className="block text-left">
              <p className="font-semibold text-[12px] sm:text-[13px] md:text-[15px] text-[#FF6B35] leading-none mb-1">
                {displayName}
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 font-medium leading-none">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.svg"
          className="hidden"
        />
      </header>
    </div>
  );
};

export default AdminDashboardNavBar;
