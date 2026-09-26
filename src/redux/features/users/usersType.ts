export interface User {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    profileImage: string | null;
    locationText: string;
    state: string;
    role: "ADMIN" | "GROOMER" | "BUYER";
    emailVerified: boolean;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_EMAIL_VERIFICATION";
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
    buyerProfile: Record<string, unknown> | null;
    groomerProfile: Record<string, unknown> | null;
    _count: {
        bookingsAsBuyer: number;
        bookingsAsGroomer: number;
        reviewsReceived: number;
        reviewsWritten: number;
        tickets: number;
    };
}

export interface Addon {
    id: string;
    title?: string;
    name?: string;
    price: number;
}

export interface Booking {
    id: string;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "ONGOING";
    serviceTitle?: string;
    bookingDate?: string;
    bookingTime?: string;
    scheduledAt?: string;      // API তে হয়তো এই নামে আসছে
    scheduledDate?: string;
    scheduledTime?: string;
    createdAt: string;
    location?: string;
    durationMinutes?: number;
    totalPrice?: number;
    petName?: string;
    petType?: string;
    addons?: Addon[];
    specialRequests?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    serviceType?: string;
    groomerName?: string;
    [key: string]: unknown;    // বাকি unknown field গুলোর জন্য
}

export interface ReviewerInfo {
    id: string;
    fullName: string;
    profileImage?: string | null;
}

export interface Review {
    id: string;
    rating: number;
    comment?: string;
    review?: string;
    reviewerName?: string;
    revieweeName?: string;
    createdAt: string;
    reviewer?: ReviewerInfo;
    reviewee?: ReviewerInfo;
}

export interface UserReviewsResponse {
    success: boolean;
    data: Review[];
}

export interface UsersListResponse {
    success: boolean;
    message: string;
    data: {
        items: User[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    };
}

export interface UserDetailsResponse {
    success: boolean;
    data: {
        user: User & {
            pets: unknown[];
            favoriteGroomers: unknown[];
            reviewsReceived: Review[];
            reviewsWritten: Review[];
            targetActionLogs: unknown[];
        };
        bookings: Booking[];
        feedback: {
            received: Review[];   // ✅ Fix: unknown[] → Review[]
            written: Review[];    // ✅ Fix: unknown[] → Review[]
        };
    };
}

export interface BlockUserRequest {
    isBlocked: boolean;
    note?: string;
}

export interface BlockUserResponse {
    success: boolean;
    message: string;
    data: Partial<User>;
}

export interface CurrentUserProfile {
    id: string;
    fullName: string;
    phone: string;
    sharePhoneWithBookingPartners: boolean;
    email: string;
    profileImage: string | null;
    streetAddress: string | null;
    unitSuite: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    role: string;
    emailVerified: boolean;
    emailVerificationExpiresAt: string | null;
    status: string;
    isBlocked: boolean;
    passwordResetExpiresAt: string | null;
    createdAt: string;
    updatedAt: string;
    buyerProfile: unknown | null;
    groomerProfile: unknown | null;
}

export interface CurrentUserResponse {
    success: boolean;
    data: CurrentUserProfile;
}

export interface UpdateProfileImageResponse {
    success: boolean;
    data: {
        id: string;
        fullName: string;
        email: string;
        profileImage: string | null;
        role: string;
    };
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    role?: string;
    status?: string;
    search?: string;
}

