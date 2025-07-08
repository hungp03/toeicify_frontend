import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/axios';
import { InternalAuthState, User, UpdateUserRequest } from '@/types';


export const useAuthStore = create<InternalAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setAccessToken: (token: string) => {
        set({ accessToken: token });
      },
      logout: async () => {
        try {
          const currentToken = get().accessToken;
          set({ user: null, accessToken: null });
          if (currentToken) {
            // Không gọi từ axios tránh lỗi vòng lặp vô hạn do 401 Unauthorized
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`,
              },
            });
          }
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
      login: async (identifier, password) => {
        try {
          const res = await api.post('/auth/login', { identifier, password });
          const token = res.data.data.accessToken;
          if (token) {
            set({ accessToken: token });
            await get().fetchUser();
            return true;
          }
          return false;
        } catch (err) {
          console.error('Login error:', err);
          return false;
        }
      },
      fetchUser: async () => {
        const token = get().accessToken;
        if (!token) return;

        try {
          const res = await api.get('/auth/me');
          const data = res.data.data;

          const user: User = {
            userId: data.userId,
            username: data.username,
            fullName: data.fullName,
            email: data.email,
            roleId: data.roleId,
            roleName: data.roleName,
            targetScore: data.targetScore || undefined,
            examDate: data.examDate || undefined,
            registrationDate: data.registrationDate,
          };

          set({ user });
        } catch (err) {
          console.error('Fetch user error:', err);
          get().logout();
        }
      },
      updateUser: async (updatedFields: UpdateUserRequest) => {
        try {
          const res = await api.put('/users/me', updatedFields);
          const updatedData = res.data.data;
          const currentUser = get().user;
          if (!currentUser) return;
          const newUser = {
            ...currentUser,
            ...updatedData,
          };
          set({ user: newUser });
        } catch (error) {
          console.error('Update user error:', error);
          throw error;
        }
      },
      oauthLogin: async (token: string) => {
        try {
          set({ accessToken: token });
          await get().fetchUser();
        } catch (err) {
          console.error('OAuth login error:', err);
        }
      },
    }),
    {
      name: 'toeic-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
        if (state.accessToken) {
          state.fetchUser();
        }
      }

    }
  )
);
