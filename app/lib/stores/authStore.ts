import { create } from "zustand";

interface AuthState {
  wasPreviouslyLogged: boolean;
  setWasPreviouslyLogged: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  wasPreviouslyLogged: true,
  setWasPreviouslyLogged: (value: boolean) =>
    set({ wasPreviouslyLogged: value }),
}));

export const useAuthState = () =>
  useAuthStore((state) => state.wasPreviouslyLogged);
