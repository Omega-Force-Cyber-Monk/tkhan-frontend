import Cookies from "js-cookie";

const secure =
  typeof window !== "undefined" && window.location.protocol === "https:";

const cookieOptions = {
  path: "/",
  secure,
  sameSite: "lax" as const,
};

export function readAccessToken(stateToken?: string | null) {
  return stateToken || Cookies.get("token") || null;
}

export function setAuthCookies(accessToken: string, refreshToken?: string | null) {
  clearAuthCookies();
  Cookies.set("token", accessToken, { ...cookieOptions, expires: 7 });
  if (refreshToken) {
    Cookies.set("refreshToken", refreshToken, { ...cookieOptions, expires: 30 });
  }
}

export function setAccessToken(accessToken: string) {
  Cookies.set("token", accessToken, { ...cookieOptions, expires: 7 });
}

export function setRefreshToken(refreshToken: string) {
  Cookies.set("refreshToken", refreshToken, { ...cookieOptions, expires: 30 });
}

export function clearAuthCookies() {
  for (const name of ["token", "refreshToken"]) {
    Cookies.remove(name);
    Cookies.remove(name, { path: "/" });
    Cookies.remove(name, { path: "/", secure: true });
    Cookies.remove(name, { path: "/", secure: false });
  }
}
