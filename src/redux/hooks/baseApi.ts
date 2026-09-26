// src/redux/hooks/baseApi.ts

import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  QueryReturnValue,
} from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import {
  clearAuthCookies,
  readAccessToken,
  setAccessToken,
  setRefreshToken,
} from "@/utils/authCookies";

interface RefreshResponse {
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: FetchBaseQueryError | Error) => void;
}

const baseURL = import.meta.env.VITE_API_ENDPOINT;

if (!baseURL) {
  throw new Error("VITE_API_ENDPOINT is not defined in environment variables");
}

const isDev = import.meta.env.DEV;

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (
  error: FetchBaseQueryError | Error | null = null,
  token: string | null = null
) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const FORM_DATA_ENDPOINTS = ["createCategory", "updateCategory"];

const rawBaseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  credentials: "include",
  prepareHeaders: (headers, { endpoint, getState }) => {
    const state = getState() as { auth?: { token?: string | null } };
    const token = readAccessToken(state.auth?.token);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!FORM_DATA_ENDPOINTS.includes(endpoint)) {
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
    }

    return headers;
  },
});

type RawBaseQueryResult = QueryReturnValue<unknown, FetchBaseQueryError, object>;

const baseQueryWithRefreshToken: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions): Promise<RawBaseQueryResult> => {
  if (isDev) {
    console.log("[API Request]", {
      url: typeof args === "string" ? args : args.url,
      method: typeof args === "string" ? "GET" : (args.method ?? "GET"),
    });
  }

  const firstResult = await rawBaseQuery(args, api, extraOptions);
  const requestUrl = typeof args === "string" ? args : (args.url ?? "");

  if (isDev && firstResult.error) {
    console.error("[API Error]", firstResult.error.status, firstResult.error.data);
  }

  const isCredentialRequest =
    requestUrl.includes("/auth/login") ||
    requestUrl.includes("/auth/create-user");

  if (firstResult.error?.status !== 401 || isCredentialRequest) {
    return firstResult;
  }

  const refreshToken = Cookies.get("refreshToken");

  if (!refreshToken) {
    clearAuthCookies();
    return firstResult;
  }

  if (isRefreshing) {
    try {
      const token = await new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });

      const retryArgs: FetchArgs =
        typeof args === "string"
          ? { url: args, headers: { Authorization: `Bearer ${token}` } }
          : {
            ...args,
            headers: {
              ...(args.headers ?? {}),
              Authorization: `Bearer ${token}`,
            },
          };

      return await rawBaseQuery(retryArgs, api, extraOptions);
    } catch (err) {
      return { error: err as FetchBaseQueryError };
    }
  }

  isRefreshing = true;

  try {
    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
        headers: { "Content-Type": "application/json" },
      },
      api,
      extraOptions
    );

    if (!refreshResult.data) {
      const error = refreshResult.error as FetchBaseQueryError;
      processQueue(error, null);
      clearAuthCookies();
      return firstResult;
    }

    const responseData = refreshResult.data as RefreshResponse;
    const newAccessToken = responseData.data?.accessToken;
    const newRefreshToken = responseData.data?.refreshToken;

    if (!newAccessToken) {
      throw new Error("No access token in refresh response");
    }

    setAccessToken(newAccessToken);

    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }

    processQueue(null, newAccessToken);

    const retryArgs: FetchArgs =
      typeof args === "string"
        ? {
          url: args,
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
            "Content-Type": "application/json",
          },
        }
        : {
          ...args,
          headers: {
            ...(args.headers ?? {}),
            Authorization: `Bearer ${newAccessToken}`,
            "Content-Type": "application/json",
          },
        };

    return await rawBaseQuery(retryArgs, api, extraOptions);
  } catch (error) {
    processQueue(error as Error, null);
    clearAuthCookies();
    return firstResult;
  } finally {
    isRefreshing = false;
  }
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  keepUnusedDataFor: 60,
  tagTypes: [
    "User",
    "Groomers",
    "PendingGroomers",
    "Dashboard",
    "Payments",
    "Notifications",
    "Tickets",
    "Reviews",
    "Bookings",
    "Categories",
    "PlatformPricing",
  ],
  endpoints: () => ({}),
});