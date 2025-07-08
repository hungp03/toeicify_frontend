export type User = {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string;
  targetScore?: number;
  lastLogin?: string;
  registrationDate?: string;
};

export type LoginResponse = {
  accessToken: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string;
};

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  setAccessToken: (token: string) => void;
  fetchUser: () => Promise<void>;
  oauthLogin: (token: string) => Promise<void>;
};

export type InternalAuthState = AuthState & {
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
};