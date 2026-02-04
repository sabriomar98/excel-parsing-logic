'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { setUser, setError } from '@/lib/redux/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Lock, Mail, ArrowRight, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface LoginRequest {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      dispatch(setError(null));
      toast.success('Logged in successfully');
      router.push('/dashboard');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch(setError(message));
      toast.error(message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-orange-50/50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-attijari-orange/10 dark:bg-attijari-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-attijari-red/10 dark:bg-attijari-red/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-br from-orange-100/20 to-red-100/20 dark:from-orange-900/5 dark:to-red-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Login Form */}
        <Card className="w-full shadow-2xl border-4 border-attijari-orange/30 dark:border-attijari-orange/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl relative overflow-hidden ring-2 ring-attijari-orange/10">
          {/* Decorative border gradient overlay */}
          <div className="absolute inset-0 rounded-lg bg-linear-to-br from-attijari-orange/10 via-transparent to-attijari-red/10 pointer-events-none"></div>
          
          <div className="p-8 lg:p-10 relative z-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-attijari-orange to-attijari-red rounded-2xl shadow-lg mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Attijariwafa Bank</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Connexion</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                  Adresse Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre.email@attijariwafa.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loginMutation.isPending}
                    required
                    className="pl-10 h-12 bg-white dark:bg-slate-800 border-2 border-gray-400 dark:border-slate-600 focus:border-attijari-orange dark:focus:border-attijari-orange focus:ring-4 focus:ring-attijari-orange/30 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                  Mot de Passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loginMutation.isPending}
                    required
                    className="pl-10 h-12 bg-white dark:bg-slate-800 border-2 border-gray-400 dark:border-slate-600 focus:border-attijari-orange dark:focus:border-attijari-orange focus:ring-4 focus:ring-attijari-orange/30 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/30 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">
                  Compte de démonstration
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-400">
                  Email: admin@attijariwafa.com • Mot de passe: admin123
                </p>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-linear-to-r from-attijari-orange to-attijari-red hover:from-attijari-red hover:to-attijari-orange text-white font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-white/20 hover:scale-[1.02] ring-2 ring-attijari-orange/50"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Plateforme sécurisée pour la gestion des feuilles d'instruction
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
                © 2026 Attijariwafa Bank. Tous droits réservés.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
