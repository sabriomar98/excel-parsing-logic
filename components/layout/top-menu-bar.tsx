'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { toggleSidebar } from '@/lib/redux/sidebarSlice';
import { Menu, X } from 'lucide-react';

export function TopMenuBar() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.sidebar.isOpen);

  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center px-4 md:px-6 shadow-sm">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title={isOpen ? 'Close Menu' : 'Open Menu'}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Optional: Add other top bar items here */}
    </div>
  );
}
