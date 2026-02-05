'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/advanced-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserPlus, Trash2, Edit, Shield, User, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export default function UsersManagementPage() {
    const router = useRouter();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        isAdmin: false,
    });

    // Rediriger si pas admin
    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            toast.error('Accès refusé - Admin requis');
            router.push('/dashboard');
        }
    }, [currentUser, router]);

    // Récupérer la liste des utilisateurs
    const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await fetch('/api/users');
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la récupération des utilisateurs');
            }
            return response.json();
        },
        enabled: currentUser?.role === 'admin', // Ne charger que si admin
    });

    // Définition des colonnes pour la table
    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Nom',
                cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center dark:text-white font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'email',
                header: 'Email',
                cell: ({ row }) => (
                    <span className="text-gray-600 dark:text-gray-400">{row.original.email}</span>
                ),
            },
            {
                accessorKey: 'role',
                header: 'Rôle',
                cell: ({ row }) => {
                    const isAdmin = row.original.role === 'admin';
                    return (
                        <Badge
                            variant={isAdmin ? 'default' : 'secondary'}
                            className={isAdmin ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                            {isAdmin ? (
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
                    );
                },
            },
            {
                accessorKey: 'createdAt',
                header: 'Date de création',
                cell: ({ row }) => {
                    const date = new Date(row.original.createdAt);
                    return (
                        <span className="text-gray-600 dark:text-gray-400">
                            {date.toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </span>
                    );
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                            >
                                <Edit className="h-4 w-4 mr-1" />
                                Modifier
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(user)}
                                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Supprimer
                            </Button>
                        </div>
                    );
                },
            },
        ],
        []
    );

    // Créer un utilisateur
    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la création');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Utilisateur créé avec succès');
            setIsCreateDialogOpen(false);
            resetForm();
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Mettre à jour un utilisateur
    const updateMutation = useMutation({
        mutationFn: async (data: { id: string; updates: Partial<typeof formData> }) => {
            const response = await fetch(`/api/users/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data.updates),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la mise à jour');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Utilisateur mis à jour avec succès');
            setIsEditDialogOpen(false);
            setSelectedUser(null);
            resetForm();
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Supprimer un utilisateur
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la suppression');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Utilisateur supprimé avec succès');
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            isAdmin: false,
        });
    };

    const handleCreate = () => {
        createMutation.mutate(formData);
    };

    const handleUpdate = () => {
        if (!selectedUser) return;
        const updates: any = {
            name: formData.name,
            email: formData.email,
            isAdmin: formData.isAdmin,
        };
        if (formData.password) {
            updates.password = formData.password;
        }
        updateMutation.mutate({ id: selectedUser.id, updates });
    };

    const handleDelete = () => {
        if (!selectedUser) return;
        deleteMutation.mutate(selectedUser.id);
    };

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            isAdmin: user.role === 'admin',
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    // Empêcher l'accès si pas admin
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-attijari-orange" />
                </div>
            </PageContainer>
        );
    }

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-attijari-orange" />
                </div>
            </PageContainer>
        );
    }

    const users = data?.users || [];

    return (
        <PageContainer>
            {/* Header */}
            <div className="space-y-2 mb-8">
                <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                    Gestion des Utilisateurs
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Gérez les utilisateurs et leurs permissions
                </p>
            </div>

            {/* Actions */}
            <div className="mb-6">
                <Button
                    onClick={() => {
                        resetForm();
                        setIsCreateDialogOpen(true);
                    }}
                    className="bg-linear-to-r from-attijari-orange to-attijari-red hover:from-attijari-red hover:to-attijari-orange"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nouvel Utilisateur
                </Button>
            </div>

            {/* Table des utilisateurs */}
            <DataTable
                columns={columns}
                data={users}
                pageSize={10}
                searchableColumns={['name', 'email']}
            />

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                        <DialogTitle>Créer un Utilisateur</DialogTitle>
                        <DialogDescription>
                            Ajoutez un nouvel utilisateur au système
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom Complet</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@attijariwafa.com"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de Passe</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isAdmin"
                                checked={formData.isAdmin}
                                onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                                className="w-4 h-4 text-attijari-orange focus:ring-attijari-orange rounded"
                            />
                            <Label htmlFor="isAdmin" className="text-sm font-normal cursor-pointer">
                                Administrateur
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                            className="bg-linear-to-r from-attijari-orange to-attijari-red"
                        >
                            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-125">
                    <DialogHeader>
                        <DialogTitle>Modifier l'Utilisateur</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations de l'utilisateur
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nom Complet</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">Nouveau Mot de Passe (optionnel)</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Laisser vide pour ne pas changer"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit-isAdmin"
                                checked={formData.isAdmin}
                                onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                                className="w-4 h-4 text-attijari-orange focus:ring-attijari-orange rounded"
                            />
                            <Label htmlFor="edit-isAdmin" className="text-sm font-normal cursor-pointer">
                                Administrateur
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={updateMutation.isPending}
                            className="bg-linear-to-r from-attijari-orange to-attijari-red"
                        >
                            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la Suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser?.name}</strong> ?
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageContainer>
    );
}
