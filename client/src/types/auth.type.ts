interface User {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  isOnline: boolean;
  lastSeen?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsAuthenticated: (status: boolean) => void;
  triggerForceLogout: () => void;
  resetAuth: () => void;
}

export type { User, AuthState };
