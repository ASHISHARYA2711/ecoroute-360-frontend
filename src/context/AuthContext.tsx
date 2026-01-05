import { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "../api/auth.service";
import type { UserRole } from "../types/user";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  driverId?: string | null;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setToken(null);
    setUser(null);
  };

  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await AuthService.refreshToken(storedRefreshToken);
    const newAccessToken = response.data.accessToken;

    localStorage.setItem("token", newAccessToken);
    setToken(newAccessToken);

    // If user state is missing, fetch it
    if (!user) {
      const storedRole = localStorage.getItem("role") as UserRole | null;
      const storedUserId = localStorage.getItem("userId");

      if (storedRole && storedUserId) {
        try {
          const userResponse = await AuthService.getCurrentUser();
          setUser({
            id: userResponse.data.user._id || storedUserId,
            name: userResponse.data.user.name,
            email: userResponse.data.user.email,
            role: storedRole,
          });
        } catch (error) {
          console.error("Failed to fetch user after refresh:", error);
        }
      }
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const storedRole = localStorage.getItem("role") as UserRole | null;
      const storedUserId = localStorage.getItem("userId");

      if (storedToken && storedRole && storedUserId) {
        try {
          // Verify token is still valid by fetching current user
          const response = await AuthService.getCurrentUser();
          setUser({
            id: response.data.user._id || storedUserId,
            name: response.data.user.name,
            email: response.data.user.email,
            role: storedRole,
          });
          setToken(storedToken);
        } catch (error) {
          // Token invalid, try to refresh
          if (storedRefreshToken) {
            try {
              await refreshAccessToken();
            } catch (refreshError) {
              console.error("Refresh failed during init:", refreshError);
              // Refresh failed, clear everything
              clearAuth();
            }
          } else {
            clearAuth();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Auto-refresh token before expiry (every 14 minutes if token expires in 15 min)
  useEffect(() => {
    if (!token) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error("Auto-refresh failed:", error);
        clearAuth();
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(refreshInterval);
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });

      // Store tokens and user info
      localStorage.setItem("token", response.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("role", response.user.role.toUpperCase());
      localStorage.setItem("userId", response.user.id);
      if (response.user.driverId) {
        localStorage.setItem("driverId", response.user.driverId);
      }

      setToken(response.token);
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role.toUpperCase() as UserRole,
        driverId: response.user.driverId,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      clearAuth();
    }
  };

  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
