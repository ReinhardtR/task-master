import create from "zustand";

type SideMenuState = {
  isOpen: boolean;
  actions: {
    toggle: () => void;
    open: () => void;
    close: () => void;
  };
};

const useSideMenuStore = create<SideMenuState>()((set) => ({
  isOpen: false,
  actions: {
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
  },
}));

export const useSideMenuIsOpen = () =>
  useSideMenuStore((state) => state.isOpen);

export const useSideMenuActions = () =>
  useSideMenuStore((state) => state.actions);
