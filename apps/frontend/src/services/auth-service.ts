import { api } from "./api";
import Cookies from "js-cookie";

export const authService = {
  async register(email: string, password: string) {
    const response = await api.post("/auth/register", { email, password });
    const { accessToken } = response.data;

    Cookies.set("accessToken", accessToken, {
      expires: 1,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken } = response.data;

    Cookies.set("accessToken", accessToken, {
      expires: 1,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response.data;
  },

  logout() {
    Cookies.remove("accessToken");
  },
};
