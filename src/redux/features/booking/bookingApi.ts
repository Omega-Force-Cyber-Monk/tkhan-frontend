import { baseApi } from "@/redux/hooks/baseApi";
import type {
  AdminBooking,
  BookingActionResponse,
  BookingDetailResponse,
  BookingListResponse,
  GetBookingsParams,
} from "./bookingTypes";

const normalizeList = (response: unknown): BookingListResponse => {
  const raw = response as {
    success?: boolean;
    data?: { items?: AdminBooking[]; meta?: BookingListResponse["data"]["meta"] } | AdminBooking[];
  };

  if (Array.isArray(raw?.data)) {
    return {
      success: raw.success ?? true,
      data: {
        items: raw.data,
        meta: {
          total: raw.data.length,
          page: 1,
          limit: raw.data.length,
          totalPages: 1,
        },
      },
    };
  }

  return {
    success: raw?.success ?? true,
    data: {
      items: raw?.data?.items ?? [],
      meta: raw?.data?.meta ?? {
        total: raw?.data?.items?.length ?? 0,
        page: 1,
        limit: raw?.data?.items?.length ?? 0,
        totalPages: 1,
      },
    },
  };
};

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<BookingListResponse, GetBookingsParams | void>({
      query: (params) => ({
        url: "/bookings",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          sortBy: params?.sortBy ?? "createdAt",
          sortOrder: params?.sortOrder ?? "desc",
          ...(params?.status ? { status: params.status } : {}),
        },
      }),
      transformResponse: (response: unknown) => normalizeList(response),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({
                type: "Bookings" as const,
                id,
              })),
              { type: "Bookings", id: "LIST" },
            ]
          : [{ type: "Bookings", id: "LIST" }],
    }),

    getBookingById: builder.query<BookingDetailResponse, string>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Bookings", id }],
    }),

    approveCompletion: builder.mutation<BookingActionResponse, string>({
      query: (id) => ({
        url: `/bookings/${id}/approve-completion`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Bookings", id },
        { type: "Bookings", id: "LIST" },
        { type: "Payments", id: "LIST" },
      ],
    }),

    rejectBooking: builder.mutation<
      BookingActionResponse,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/bookings/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Bookings", id },
        { type: "Bookings", id: "LIST" },
        { type: "Payments", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useApproveCompletionMutation,
  useRejectBookingMutation,
} = bookingApi;
