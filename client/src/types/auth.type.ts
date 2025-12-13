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

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  resetAuth: () => void;
}

export type { User, AuthState };
