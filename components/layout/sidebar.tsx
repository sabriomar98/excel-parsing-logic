'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard,
  FolderOpen,
  Upload,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/sidebar-context';

interface NavItem {
  icon: any;
  label: string;
  href: string;
  badge?: number;
  section?: string;
}

const navItems: NavItem[] = [
  { 
    icon: LayoutDashboard, 
    label: 'Tableau de bord', 
    href: '/dashboard',
    section: 'main'
  },
  { 
    icon: FolderOpen, 
    label: 'Projets', 
    href: '/projects',
    section: 'main'
  },
  { 
    icon: Calendar, 
    label: 'Imputations', 
    href: '/imputation',
    section: 'main'
  },
  { 
    icon: Upload, 
    label: 'Télécharger', 
    href: '/upload',
    section: 'actions'
  },
  { 
    icon: BarChart3, 
    label: 'Analytique', 
    href: '/analytics',
    section: 'actions'
  },
  { 
    icon: User, 
    label: 'Mon Profil', 
    href: '/profile',
    section: 'account'
  },
  { 
    icon: Users, 
    label: 'Utilisateurs', 
    href: '/admin/users',
    section: 'admin'
  },
];

export default function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin';

  const isActive = (href: string) => pathname === href;

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-slate-700/50 dark:border-slate-800/50 shadow-2xl z-50 lg:flex flex-col hidden"
      >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50 dark:border-slate-800/50">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-attijari-orange to-attijari-red flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-attijari-orange/50">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">Attijariwafa</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">Gestion Projets</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-800/50 rounded-lg transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>



      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Main Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              Principal
            </p>
          )}
          
          {navItems.filter(item => item.section === 'main').map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                  active
                    ? "bg-linear-to-r from-attijari-orange to-attijari-red text-white shadow-lg shadow-attijari-orange/50"
                    : "text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-800/50",
                  isCollapsed && "justify-center"
                )}
              >
                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                <Icon className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  active && "scale-110",
                  hoveredItem === item.href && !active && "scale-110"
                )} />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {item.badge && !isCollapsed && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 dark:bg-slate-950 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700 dark:border-slate-800">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900 dark:border-r-slate-950" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions Section */}
        <div className="space-y-1 pt-4">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              Actions
            </p>
          )}
          
          {navItems.filter(item => item.section === 'actions').map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                  active
                    ? "bg-linear-to-r from-attijari-orange to-attijari-red text-white shadow-lg shadow-attijari-orange/50"
                    : "text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-800/50",
                  isCollapsed && "justify-center"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                <Icon className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  active && "scale-110",
                  hoveredItem === item.href && !active && "scale-110"
                )} />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isCollapsed && (
                  <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 dark:bg-slate-950 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700 dark:border-slate-800">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900 dark:border-r-slate-950" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Account Section */}
        <div className="space-y-1 pt-4 border-t border-slate-700 dark:border-slate-800">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              Compte
            </p>
          )}
          
          {navItems.filter(item => item.section === 'account').map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                  active
                    ? "bg-linear-to-r from-attijari-orange to-attijari-red text-white shadow-lg shadow-attijari-orange/50"
                    : "text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-800/50",
                  isCollapsed && "justify-center"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                <Icon className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  active && "scale-110",
                  hoveredItem === item.href && !active && "scale-110"
                )} />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isCollapsed && (
                  <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 dark:bg-slate-950 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700 dark:border-slate-800">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900 dark:border-r-slate-950" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Section - Visible uniquement pour les admins */}
        {isAdmin && (
          <div className="space-y-1 pt-4 border-t border-slate-700 dark:border-slate-800">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
                Administration
              </p>
            )}
            
            {navItems.filter(item => item.section === 'admin').map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-attijari-orange to-attijari-red text-white shadow-lg shadow-attijari-orange/50"
                      : "text-slate-400 dark:text-slate-500 hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-800/50",
                    isCollapsed && "justify-center"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="activeIndicatorAdmin"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  <Icon className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-200",
                    active && "scale-110",
                    hoveredItem === item.href && !active && "scale-110"
                  )} />
                  
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isCollapsed && (
                    <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 dark:bg-slate-950 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700 dark:border-slate-800">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900 dark:border-r-slate-950" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </motion.aside>
    </>
  );
}
