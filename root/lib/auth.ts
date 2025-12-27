import { api } from "./http";

export type Role = "Admin" | "Depot" | "Store" | "Driver";

export interface UserProfile {
  email: string;
  roles: Role[];
}

/* =========================
   LOGIN
========================= */
export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<string> {
  const res = await api.post("/auth/login", { email, password });

  const token: string | undefined =
    res.data?.token ?? res.data?.accessToken;

  if (!token) {
    throw new Error("Token alınamadı");
  }

  localStorage.setItem("token", token);
  return token;
}

/* =========================
   PROFILE
========================= */
export async function getProfile(): Promise<UserProfile> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token bulunamadı");

  try {
    const res = await api.get("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data as UserProfile;
  } catch {
    // 🔐 fallback: token decode
    const payload = JSON.parse(atob(token.split(".")[1]));

    return {
      email: payload.email,
      roles: [
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      ],
    };
  }
}


/* =========================
   ROLE → ROUTE MAP
========================= */
export const roleRoutes: Record<Role, string> = {
  Admin: "/dashboard/admin",
  Depot: "/dashboard/depot",
  Store: "/dashboard/store",
  Driver: "/dashboard/driver",
};

/* =========================
   REDIRECT HELPER
========================= */
export function redirectForProfile(profile: UserProfile): string {
  const role = profile.roles[0];

  switch (role) {
    case "Depot":
      return "/dashboard/depot/products"; // 🔥 direkt ürünler
    case "Admin":
      return "/dashboard/admin";
    case "Store":
      return "/dashboard/store";
    case "Driver":
      return "/dashboard/driver";
    default:
      return "/login";
  }
}


/* =========================
   LOGOUT
========================= */
export function logout() {
  localStorage.removeItem("token");
}
