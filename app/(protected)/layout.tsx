'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { setUser } from '@/lib/redux/authSlice';
import { RootState } from '@/lib/redux/store';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar';
import { NavBar } from '@/components/layout/navbar';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

function ProtectedContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar />
      <main 
        className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          "flex flex-col",
          "w-full",
          "lg:ml-[280px]",
          isCollapsed && "lg:ml-20"
        )}
      >
        <NavBar />
        {/* Content wrapper avec padding et full width */}
        <div className={cn(
          "flex-1 w-full",
          "px-4 sm:px-6 lg:px-8",
          "py-6",
          "overflow-auto"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    },
  });

  useEffect(() => {
    if (data?.user && !user) {
      dispatch(setUser(data.user));
    }
  }, [data, user, dispatch]);

  useEffect(() => {
    if (error && !isLoading) {
      router.push('/login');
    }
  }, [error, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-slate-50 to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user && !isLoading) {
    return null;
  }

  return (
    <SidebarProvider>
      <ProtectedContent>{children}</ProtectedContent>
    </SidebarProvider>
  );
}
