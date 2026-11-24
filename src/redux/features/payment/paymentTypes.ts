// src/redux/features/payment/paymentTypes.ts

export type PaymentStatus =
    | "SUCCEEDED"
    | "PENDING"
    | "FAILED"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED"
    | string;

export interface PaymentBooking {
    id: string;
    bookingNumber: string;
    buyerId: string;
    groomerId: string;
    petId: string;
    availabilitySlotId: string;
    serviceLocation: string;
    addressLine: string;
    state: string;
    city: string;
    postalCode: string;
    note: string | null;
    status: string;
    subtotalAmount: string;
    platformFeeAmount: string;
    groomerEarningAmount: string;
    totalAmount: string;
    requestedAt: string | null;
    acceptedAt: string | null;
    rejectedAt: string | null;
    cancelledAt: string | null;
    inProgressAt: string | null;
    completionRequestedAt: string | null;
    completedAt: string | null;
    refundedAt: string | null;
    rejectionReason: string | null;
    cancellationReason: string | null;
    cancelledBy?: "BUYER" | "GROOMER" | "ADMIN" | "SYSTEM" | null;
    isLateCancellation?: boolean;
    refundPercent?: number | null;
    refundAmount?: string | null;
    lateFeeAmount?: string | null;
    termsAcceptedAt?: string | null;
    completionNote: string | null;
    beforeImage: string | null;
    afterImage: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: string;
    bookingId: string;
    amount: string;
    currency: string;
    status: PaymentStatus;
    stripeCheckoutSessionId: string | null;
    stripePaymentIntentId: string | null;
    stripeRefundId: string | null;
    refundedAmount?: string | null;
    failureReason: string | null;
    paidAt: string | null;
    refundedAt: string | null;
    createdAt: string;
    updatedAt: string;
    booking: PaymentBooking;
}

export interface PaymentListResponse {
    success: boolean;
    data: Payment[];
}