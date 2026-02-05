'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { logout } from '@/lib/redux/authSlice';
import {
  Menu,
  X,
  LogOut,
  Settings,
  BarChart3,
  Upload,
  FolderOpen,
  ChevronDown,
  User,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

export function NavBar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isCollapsed } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  const user = userData?.user;

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Échec de la déconnexion');
      }
      dispatch(logout());
      toast.success('Déconnexion réussie');
      router.push('/login');
    } catch (error) {
      toast.error('Échec de la déconnexion');
    }
  };

  const menuItems = [
    {
      icon: FolderOpen,
      label: 'Projets',
      href: '/projects',
      description: 'Voir tous les projets'
    },
    {
      icon: Calendar,
      label: 'Imputations',
      href: '/imputation',
      description: 'Suivi des imputations quotidiennes'
    },
    {
      icon: Upload,
      label: 'Télécharger',
      href: '/upload',
      description: 'Télécharger nouvelle instruction'
    },
    {
      icon: BarChart3,
      label: 'Analytique',
      href: '/analytics',
      description: 'Voir les analytiques'
    },
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav
        className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">{/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-attijari-orange dark:hover:text-attijari-orange transition-colors flex items-center gap-2 group"
                  >
                    <Icon className="w-4 h-4 group-hover:text-attijari-orange transition-colors" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Section - User Profile & Actions */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                )}
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center dark:text-white font-bold text-sm shadow-lg">
                    {isLoading ? '?' : user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  {/* User Info */}
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {isLoading ? 'Chargement...' : user?.name || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {isLoading ? '...' : user?.isImputer ? 'Imputeur' : 'Standard'}
                    </p>
                  </div>

                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-all" style={{
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Section */}
                    <div className="relative px-6 py-5 bg-linear-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-b border-orange-200 dark:border-orange-800/30">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center dark:text-white font-bold text-xl shadow-lg ">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">{user?.name || 'Utilisateur'}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-0.5">{user?.email || 'utilisateur@exemple.com'}</p>
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-700 shadow-sm border border-orange-200 dark:border-orange-700">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-slate-700 dark:text-slate-300">
                              {user?.isImputer ? 'Administrateur Imputeur' : 'Utilisateur Standard'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-6 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-orange-900/30 transition-colors">
                          <User className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-attijari-orange" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">Tableau de Bord</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Vue d'ensemble</p>
                        </div>
                      </Link>

                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-6 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-orange-900/30 transition-colors">
                          <User className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-attijari-orange" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">Mon Profil</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Gérer mon compte</p>
                        </div>
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-700 my-2"></div>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-6 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                          <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-red-600 dark:text-red-400">Déconnexion</p>
                          <p className="text-xs text-red-500 dark:text-red-500">Quitter la session</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
          <div className="px-4 py-3 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-attijari-orange transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
