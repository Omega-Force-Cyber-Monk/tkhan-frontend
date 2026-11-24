import { baseApi } from "@/redux/hooks/baseApi";

export type AdminRefundType = "POLICY" | "FULL" | "PARTIAL" | "NONE";

export interface CancellationQuote {
  bookingId: string;
  bookingNumber: string;
  actor: "BUYER" | "GROOMER" | "ADMIN";
  status: string;
  canCancel: boolean;
  blockedReason: string | null;
  hoursUntilStart: number | null;
  paidAmount: number;
  refundPercent: number;
  refundAmount: number;
  lateFeeAmount: number;
  isLateCancellation: boolean;
  countsAsNoShow: boolean;
  title: string;
  message: string;
}

export interface AdminCancelBookingBody {
  id: string;
  refundType: AdminRefundType;
  refundAmount?: number;
  reason: string;
  recordGroomerNoShow?: boolean;
}

export interface AdminRefundBookingBody {
  id: string;
  refundType: "FULL" | "PARTIAL";
  refundAmount?: number;
  reason: string;
}

export interface GroomerNoShow {
  id: string;
  hoursBeforeStart: string;
  reason: string | null;
  actionTaken: "NONE" | "WARNING" | "SUSPENSION" | "BLOCK";
  createdAt: string;
  booking: { id: string; bookingNumber: string; cancelledAt: string | null };
  groomerProfile: {
    id: string;
    noShowCount: number;
    suspendedUntil: string | null;
    user: { id: string; fullName: string; email: string; isBlocked: boolean };
  };
}

interface Envelope<T> {
  success: boolean;
  data: T;
}

const invalidateBooking = (id: string) => [
  { type: "Bookings" as const, id },
  { type: "Bookings" as const, id: "LIST" },
  { type: "Payments" as const, id: "LIST" },
];

export const cancellationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCancellationPreview: builder.query<Envelope<CancellationQuote>, string>({
      query: (id) => ({ url: `/bookings/${id}/cancellation-preview`, method: "GET" }),
      keepUnusedDataFor: 0,
    }),
    adminCancelBooking: builder.mutation<Envelope<unknown>, AdminCancelBookingBody>({
      query: ({ id, ...body }) => ({
        url: `/admin/bookings/${id}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => invalidateBooking(id),
    }),
    adminRefundBooking: builder.mutation<Envelope<unknown>, AdminRefundBookingBody>({
      query: ({ id, ...body }) => ({
        url: `/admin/bookings/${id}/refund`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => invalidateBooking(id),
    }),
    getGroomerNoShows: builder.query<Envelope<GroomerNoShow[]>, void>({
      query: () => ({ url: "/admin/groomer-no-shows", method: "GET" }),
      keepUnusedDataFor: 30,
    }),
    liftGroomerSuspension: builder.mutation<Envelope<unknown>, string>({
      query: (groomerProfileId) => ({
        url: `/admin/groomers/${groomerProfileId}/lift-suspension`,
        method: "PATCH",
        body: {},
      }),
    }),
  }),
});

export const {
  useGetCancellationPreviewQuery,
  useAdminCancelBookingMutation,
  useAdminRefundBookingMutation,
  useGetGroomerNoShowsQuery,
  useLiftGroomerSuspensionMutation,
} = cancellationApi;
