import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  isOpen: boolean;
}

const initialState: SidebarState = {
  isOpen: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    closeSidebar: (state) => {
      state.isOpen = false;
    },
    openSidebar: (state) => {
      state.isOpen = true;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, closeSidebar, openSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
