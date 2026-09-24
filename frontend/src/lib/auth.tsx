
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "./api";

export type User = {
  user_id: number;
  name: string;
  email: string;
  role: "admin" | "faculty" | "student";
  admin_id?: number;
  faculty_id?: number;
  student_id?: number;
  username?: string;
  course_id?: number;
  enrollment_status?: string;
  dept_id?: number;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: {
    email?: string;
    username?: string;
    password: string;
  }) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    course_id?: number;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (payload: {
    email?: string;
    username?: string;
    password: string;
  }) => {
    const res = await api<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      course_id?: number;
    }) => {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    []
  );

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) return null;
    try {
      const res = await api<{ user: User }>("/api/auth/me");
      localStorage.setItem("user", JSON.stringify(res.user));
      setUser(res.user);
      return res.user;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser }),
    [user, token, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
