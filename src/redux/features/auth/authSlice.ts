
import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { clearAuthCookies, setAuthCookies } from "@/utils/authCookies";
import { authApi } from "./authApi";
import { AppRootState } from "@/redux/store";
import { LoginResponse, TAuth } from "./ auth.type";
import { readSavedProfileImage } from "@/utils/adminProfilePic";


const initialState: TAuth = {
  user: null,
  token: null,
  refreshToken: null,
};


const clearAuthStorage = () => {
  clearAuthCookies();
  localStorage.removeItem("user");
  localStorage.removeItem("persist:auth");
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setProfileImage: (state, { payload }: PayloadAction<string>) => {
      if (!state.user) return;
      state.user.profileImage = payload;
      localStorage.setItem(
        "user",
        JSON.stringify({ ...current(state.user), profileImage: payload }),
      );
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      clearAuthStorage(); // ✅ সব clear
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
    loadUserFromStorage: (state) => {
      const token = Cookies.get("token");
      const refreshToken = Cookies.get("refreshToken");
      const storedUser = localStorage.getItem("user");

      if (token && refreshToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.role === "ADMIN") {
            state.user = user;
            state.token = token;
            state.refreshToken = refreshToken;
          } else {
            clearAuthStorage(); // ✅ non-admin হলেও সব clear
          }
        } catch (error) {
          console.error("Error loading user from storage:", error);
          clearAuthStorage(); // ✅ parse error হলেও clear
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }: PayloadAction<LoginResponse>) => {
        if (payload.success && payload.data) {
          if (payload.data.user.role !== "ADMIN") {
            console.error("Access denied: Admin role required");
            return;
          }
          const savedProfileImage = readSavedProfileImage(payload.data.user.id);
          const user = {
            ...payload.data.user,
            profileImage: savedProfileImage || payload.data.user.profileImage,
          };
          state.user = user;
          state.token = payload.data.accessToken;
          state.refreshToken = payload.data.refreshToken;
          setAuthCookies(payload.data.accessToken, payload.data.refreshToken);
          localStorage.setItem("user", JSON.stringify(user));
        }
      }
    );

    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      clearAuthStorage();
    });
  },
});

export const { logOut, loadUserFromStorage, setProfileImage } = authSlice.actions;
export default authSlice.reducer;

export const useCurrentToken = (state: AppRootState) => state.auth.token;
export const useCurrentUser = (state: AppRootState) => state.auth.user;
export const useCurrentRefreshToken = (state: AppRootState) =>
  state.auth.refreshToken;
export const useIsAuthenticated = (state: AppRootState) =>
  !!state.auth.token && !!state.auth.user && state.auth.user?.role === "ADMIN";