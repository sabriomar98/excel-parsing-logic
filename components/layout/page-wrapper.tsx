'use client';

import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className="ml-20 lg:ml-80 transition-all duration-300">
      <div className={cn("min-h-screen bg-linear-to-br from-slate-50 to-slate-100", className)}>
        {children}
      </div>
    </div>
  );
}
