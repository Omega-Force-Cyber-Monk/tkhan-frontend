// src/redux/features/users/usersApi.ts

import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { baseApi } from "@/redux/hooks/baseApi";
import { missingUserMessage, noteStaleAccount, readAccessToken } from "@/utils/authCookies";
import {
    UsersListResponse,
    UserDetailsResponse,
    BlockUserResponse,
    BlockUserRequest,
    GetUsersParams,
    UpdateProfileImageResponse,
    CurrentUserResponse,
} from "./usersType";

const profileImageToken = (getState: () => unknown) => {
    const state = getState() as { auth?: { token?: string | null } };
    return readAccessToken(state.auth?.token);
};

export const usersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /admin/users
        getUsers: builder.query<UsersListResponse, GetUsersParams>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params.page) queryParams.append("page", params.page.toString());
                if (params.limit) queryParams.append("limit", params.limit.toString());
                if (params.sortBy) queryParams.append("sortBy", params.sortBy);
                if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
                if (params.role) queryParams.append("role", params.role);
                if (params.status) queryParams.append("status", params.status);
                if (params.search) queryParams.append("search", params.search);

                return {
                    url: "/admin/users",
                    method: "GET",
                    params: queryParams,
                };
            },
            providesTags: (result) =>
                result?.data?.items
                    ? [
                        ...result.data.items.map(({ id }: { id: string }) => ({
                            type: "User" as const,
                            id,
                        })),
                        { type: "User", id: "LIST" },
                    ]
                    : [{ type: "User", id: "LIST" }],
            keepUnusedDataFor: 30,
        }),

        // GET /admin/users/:id
        getUserDetails: builder.query<UserDetailsResponse, string>({
            query: (userId) => ({
                url: `/admin/users/${userId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
            keepUnusedDataFor: 60,
        }),

        // PATCH /admin/users/:id/block
        blockUser: builder.mutation<
            BlockUserResponse,
            { userId: string; data: BlockUserRequest }
        >({
            query: ({ userId, data }) => ({
                url: `/admin/users/${userId}/block`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: "User", id: userId },
                { type: "User", id: "LIST" },
            ],
        }),

        // GET /users/me
        getMe: builder.query<CurrentUserResponse, void>({
            query: () => ({
                url: "/users/me",
                method: "GET",
            }),
            providesTags: [{ type: "User", id: "ME" }],
        }),

        // PATCH /users/me/profile-image
        // Raw fetch so the file is sent once. The shared base query builds the
        // request twice, which can drop the multipart body.
        updateProfileImage: builder.mutation<UpdateProfileImageResponse, File>({
            async queryFn(file, api) {
                const token = profileImageToken(api.getState);
                if (!token) {
                    return {
                        error: {
                            status: 401,
                            data: { error: { message: "Please sign in again, then upload the picture." } },
                        } as FetchBaseQueryError,
                    };
                }

                const bytes = await file.arrayBuffer();
                const type = file.type.startsWith("image/") ? file.type : "image/jpeg";
                const filename = type === "image/svg+xml"
                    ? "profile.svg"
                    : type === "image/png"
                      ? "profile.png"
                      : "profile.jpg";
                const formData = new FormData();
                formData.append("profileImage", new Blob([bytes], { type }), filename);

                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_API_ENDPOINT}/users/me/profile-image`,
                        {
                            method: "PATCH",
                            headers: {
                                Accept: "*/*",
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            },
                            body: formData,
                        },
                    );

                    const data = await response.json().catch(() => null);
                    if (!response.ok) {
                        if (response.status === 404 && missingUserMessage(data)) {
                            noteStaleAccount("This account was not found. Please sign in again.");
                            api.dispatch({ type: "auth/logOut" });
                        }
                        return {
                            error: {
                                status: response.status,
                                data,
                            } as FetchBaseQueryError,
                        };
                    }

                    return { data: data as UpdateProfileImageResponse };
                } catch (error) {
                    return {
                        error: {
                            status: "FETCH_ERROR",
                            error: String(error),
                        } as FetchBaseQueryError,
                    };
                }
            },
            invalidatesTags: [{ type: "User", id: "ME" }],
            async onQueryStarted(_file, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const imageUrl = data.data?.profileImage;
                    if (!imageUrl) return;
                    dispatch(
                        usersApi.util.updateQueryData("getMe", undefined, (draft) => {
                            draft.data.profileImage = imageUrl;
                        }),
                    );
                } catch {
                    // The navbar shows the request error.
                }
            },
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserDetailsQuery,
    useGetMeQuery,
    useBlockUserMutation,
    useUpdateProfileImageMutation,
} = usersApi;