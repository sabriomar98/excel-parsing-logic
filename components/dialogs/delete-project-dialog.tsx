'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface DeleteProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    projectName: string;
    versionCount?: number;
    isLoading?: boolean;
}

export function DeleteProjectDialog({
    open,
    onOpenChange,
    onConfirm,
    projectName,
    versionCount = 0,
    isLoading = false,
}: DeleteProjectDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-red-200 bg-red-50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-900">
                        Delete Project: {projectName}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. All data will be permanently deleted including:
                    </AlertDialogDescription>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-red-800 text-sm mb-4">
                        <li>{versionCount} version{versionCount !== 1 ? 's' : ''}</li>
                        <li>All collaborators assignments</li>
                        <li>All planning data</li>
                    </ul>
                </AlertDialogHeader>
                <div className="flex justify-end gap-2">
                    <AlertDialogCancel disabled={isLoading}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Project'
                        )}
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
