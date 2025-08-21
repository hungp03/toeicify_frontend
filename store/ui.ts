import { create } from "zustand"

type UIState = {
  openWidget: "chat" | "dict" | null
  setOpenWidget: (widget: "chat" | "dict" | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  openWidget: null,
  setOpenWidget: (widget) => set({ openWidget: widget }),
}))