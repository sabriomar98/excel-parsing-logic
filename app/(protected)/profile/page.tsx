'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Lock, Loader2, Shield, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [profileData, setProfileData] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Récupérer le profil
    const { data, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await fetch('/api/profile');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du profil');
            }
            const data = await response.json();
            setProfileData({ name: data.user.name, email: data.user.email });
            return data;
        },
    });

    // Mettre à jour le profil
    const profileMutation = useMutation({
        mutationFn: async (data: typeof profileData) => {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la mise à jour');
            }
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success(data.message || 'Profil mis à jour avec succès');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Changer le mot de passe
    const passwordMutation = useMutation({
        mutationFn: async (data: typeof passwordData) => {
            const response = await fetch('/api/profile/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors du changement de mot de passe');
            }
            return response.json();
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Mot de passe changé avec succès');
            // Rediriger vers la page de login après 2 secondes
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleProfileUpdate = () => {
        if (!profileData.name.trim() || !profileData.email.trim()) {
            toast.error('Tous les champs sont requis');
            return;
        }
        profileMutation.mutate(profileData);
    };

    const handlePasswordChange = () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Tous les champs sont requis');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        passwordMutation.mutate(passwordData);
    };

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-attijari-orange" />
                </div>
            </PageContainer>
        );
    }

    const user = data?.user;

    return (
        <PageContainer>
            {/* Header */}
            <div className="space-y-2 mb-8">
                <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">Mon Profil</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Gérez vos informations personnelles et votre sécurité
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="lg:col-span-1 p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center dark:text-white font-bold text-3xl mb-4 shadow-lg">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {user?.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{user?.email}</p>
                        <Badge
                            variant={user?.isImputer ? 'default' : 'secondary'}
                            className={user?.isImputer ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                            {user?.isImputer ? (
                                <>
                                    <Shield className="h-3 w-3 mr-1" />
                                    Administrateur
                                </>
                            ) : (
                                <>
                                    <User className="h-3 w-3 mr-1" />
                                    Utilisateur
                                </>
                            )}
                        </Badge>

                        <div className="mt-6 w-full space-y-3 text-left">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="h-4 w-4" />
                                <span>Membre depuis {new Date(user?.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Settings Tabs */}
                <Card className="lg:col-span-2 p-6">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile">
                                <User className="h-4 w-4 mr-2" />
                                Informations
                            </TabsTrigger>
                            <TabsTrigger value="password">
                                <Lock className="h-4 w-4 mr-2" />
                                Sécurité
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="space-y-6 mt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom Complet</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="name"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="pl-10"
                                            placeholder="Votre nom complet"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="pl-10"
                                            placeholder="votre.email@attijariwafa.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
                                <Button
                                    onClick={handleProfileUpdate}
                                    disabled={profileMutation.isPending}
                                    className="bg-linear-to-r from-attijari-orange to-attijari-red hover:from-attijari-red hover:to-attijari-orange"
                                >
                                    {profileMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Enregistrer les Modifications
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Password Tab */}
                        <TabsContent value="password" className="space-y-6 mt-6">
                            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-lg p-4 mb-6">
                                <p className="text-sm text-orange-800 dark:text-orange-300">
                                    <Lock className="h-4 w-4 inline mr-2" />
                                    Après le changement de mot de passe, vous serez automatiquement déconnecté et devrez vous reconnecter avec votre nouveau mot de passe.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Mot de Passe Actuel</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) =>
                                                setPasswordData({ ...passwordData, currentPassword: e.target.value })
                                            }
                                            className="pl-10"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nouveau Mot de Passe</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) =>
                                                setPasswordData({ ...passwordData, newPassword: e.target.value })
                                            }
                                            className="pl-10"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Minimum 6 caractères
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmer le Nouveau Mot de Passe</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                            }
                                            className="pl-10"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
                                <Button
                                    onClick={handlePasswordChange}
                                    disabled={passwordMutation.isPending}
                                    className="bg-linear-to-r from-attijari-orange to-attijari-red hover:from-attijari-red hover:to-attijari-orange"
                                >
                                    {passwordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Changer le Mot de Passe
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </PageContainer>
    );
}
