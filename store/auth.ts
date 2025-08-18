import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InternalAuthState, User, UpdateUserRequest } from '@/types';
import { apiLogin, getUserInfo } from '@/lib/api/auth';
import { updateUserInfo } from '@/lib/api/user';
import { registerFcmToken } from '@/lib/fcm';

export const useAuthStore = create<InternalAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      hasHydrated: false,
      isFetchingUser: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: async () => {
        const token = get().accessToken;
        set({ user: null, accessToken: null });
        localStorage.removeItem('toeic-auth-storage');
        if (token) {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
        }
      },
      login: async (identifier, password) => {
        try {
          const res = await apiLogin(identifier, password);
          const token = res.data.accessToken;
          if (token) {
            set({ accessToken: token });
            await get().fetchUser();
          }
          const user = get().user;
          if (user) {
            await registerFcmToken(user.userId);
          }
          return res;
        } catch (err) {
          console.error('Login error:', err);
          return err;
        }
      },
      fetchUser: async () => {
        const token = get().accessToken;
        if (!token) return;
        set({ isFetchingUser: true });
        try {
          const res = await getUserInfo();
          const data = res.data;
          const user: User = {
            userId: data.userId,
            username: data.username,
            fullName: data.fullName,
            email: data.email,
            roleId: data.roleId,
            roleName: data.roleName,
            targetScore: data.targetScore ?? undefined,
            examDate: data.examDate ?? undefined,
            registrationDate: data.registrationDate,
          };
          set({ user });
        } catch (err) {
          console.error('Fetch user error:', err);
          get().logout();
        }
        finally {
          set({ isFetchingUser: false });
        }
      },
      updateUser: async (updatedFields: UpdateUserRequest) => {
        try {
          const res = await updateUserInfo(updatedFields);
          const updatedData = res.data;
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
        set({ accessToken: token });
        await get().fetchUser();
        const user = get().user;
        if (user) {
          await registerFcmToken(user.userId);
        }
      },
    }),
    {
      name: 'toeic-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
        if (state.accessToken) {
          state.fetchUser();
        }
      },
    }
  )
);