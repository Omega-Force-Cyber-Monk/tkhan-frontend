export type BookingStatus =
  | "PENDING"
  | "REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "IN_PROGRESS"
  | "COMPLETION_REQUESTED"
  | "COMPLETED"
  | "REFUNDED"
  | string;

export interface BookingService {
  id: string;
  bookingId?: string;
  serviceId?: string;
  serviceTitle?: string;
  serviceDescription?: string;
  durationMinutes?: number;
  price?: string;
  categoryName?: string;
}

export interface BookingUser {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  profileImage?: string | null;
  locationText?: string;
  groomerProfile?: {
    businessName?: string;
  } | null;
}

export interface BookingPet {
  id: string;
  name?: string;
  breed?: string;
  petType?: string;
}

export interface AdminBooking {
  id: string;
  bookingNumber: string;
  buyerId: string;
  groomerId: string;
  petId?: string;
  status: BookingStatus;
  note: string | null;
  completionNote: string | null;
  beforeImage: string | null;
  afterImage: string | null;
  completionRequestedAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  totalAmount?: string;
  subtotalAmount?: string;
  createdAt: string;
  updatedAt?: string;
  scheduledDate?: string | null;
  services?: BookingService[];
  buyer?: BookingUser | null;
  groomer?: BookingUser | null;
  pet?: BookingPet | null;
}

export interface BookingListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingListResponse {
  success: boolean;
  data: {
    items: AdminBooking[];
    meta: BookingListMeta;
  };
}

export interface BookingDetailResponse {
  success: boolean;
  data: AdminBooking;
}

export interface BookingActionResponse {
  success: boolean;
  message?: string;
  data?: AdminBooking;
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: BookingStatus;
}

export type ServiceReviewStatus = "pending" | "accepted" | "rejected";

export interface ServiceReviewItem {
  id: string;
  groomer: string;
  service: string;
  beforeImg: string;
  afterImg: string;
  reviewText: string;
  status: ServiceReviewStatus;
  bookingStatus: string;
  bookingNumber?: string;
  canReview: boolean;
}

export const mapBookingStatusToReview = (
  status: string,
): ServiceReviewStatus => {
  if (status === "COMPLETED") return "accepted";
  if (status === "REJECTED") return "rejected";
  return "pending";
};

export const mapBookingToReview = (booking: AdminBooking): ServiceReviewItem => {
  const groomer =
    booking.groomer?.groomerProfile?.businessName ||
    booking.groomer?.fullName ||
    "Groomer";

  const service =
    booking.services?.[0]?.serviceTitle ||
    booking.bookingNumber ||
    "Service booking";

  return {
    id: booking.id,
    groomer,
    service,
    beforeImg: booking.beforeImage ?? "",
    afterImg: booking.afterImage ?? "",
    reviewText:
      booking.completionNote || booking.note || "No notes provided yet.",
    status: mapBookingStatusToReview(booking.status),
    bookingStatus: booking.status,
    bookingNumber: booking.bookingNumber,
    canReview: booking.status === "COMPLETION_REQUESTED",
  };
};
