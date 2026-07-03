import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    setUser(data.user);
    return data.user;
  }

  async function login(payload) {
    const { data } = await api.post("/auth/login", payload);
    setUser(data.user);
    return data.user;
  }

  async function adminLogin(payload) {
    const { data } = await api.post("/auth/admin/login", payload);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  async function updateProfile(payload) {
    const { data } = await api.patch("/auth/me", payload);
    setUser(data.user);
    return data.user;
  }

  const value = { user, loading, login, register, adminLogin, logout, updateProfile, refreshUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
