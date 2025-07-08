export type User = {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string;
  examDate?: string; 
  targetScore?: number;
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
  updateUser: (updatedFields: UpdateUserRequest) => Promise<void>;
  oauthLogin: (token: string) => Promise<void>;
};

export type InternalAuthState = AuthState & {
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
};