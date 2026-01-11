import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  name: string;
  setName: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      setName: (name) => set({ name }),
    }),
    {
      name: 'user-storage',
    }
  )
);
