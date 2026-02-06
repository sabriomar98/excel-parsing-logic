'use client';

import React from "react"

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useInvalidateCache } from '@/lib/hooks/useInvalidateCache';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/page-container';
import { ImputationStatus } from '@/components/ui/imputation-status';

interface UploadResponse {
  message: string;
  projectId: string;
  versionId: string;
  versionNumber: number;
}

export default function UploadPage() {
  const router = useRouter();
  const { invalidateAfterUpload } = useInvalidateCache();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Upload error response:', { status: response.status, data });
        const errorMessage = data.details || data.error || 'Échec de l\'upload';
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).data = data;
        throw error;
      }

      return data as Promise<UploadResponse>;
    },
    onSuccess: (data) => {
      // Invalider les caches pour synchroniser les données
      invalidateAfterUpload();
      
      toast.success(data.message);
      setTimeout(() => {
        router.push(`/projects/${data.projectId}`);
      }, 1000);
    },
    onError: (error) => {
      const httpStatus = (error as any).status;
      const errorData = (error as any).data;
      const message = error instanceof Error ? error.message : 'Upload failed';
      
      console.log('Mutation error:', { httpStatus, message, errorData, error });
      
      // Handle 409 Conflict - File already uploaded
      if (httpStatus === 409) {
        toast.error('⚠️ Ce fichier a déjà été uploadé. Veuillez vérifier vos projets ou uploader une version modifiée.');
        return;
      }
      
      // Handle 400 - No valid collaborators
      if (httpStatus === 400 && message.includes('No valid collaborators')) {
        toast.error('❌ Aucun collaborateur valide trouvé. Le fichier doit contenir au moins un collaborateur au format: "Collaborateur (I.KADA)" ou "Jean Dupont"');
        return;
      }
      
      // Gestion des erreurs génériques
      if (message.includes('already been uploaded') || message.includes('This file has already')) {
        toast.error('⚠️ Ce fichier a déjà été uploadé. Veuillez vérifier vos projets ou uploader une version modifiée.');
      } else if (message.includes('No valid collaborators')) {
        toast.error('❌ Aucun collaborateur valide trouvé. Le fichier doit contenir au moins un collaborateur au format: "Collaborateur (I.KADA)" ou "Jean Dupont"');
      } else if (message.includes('Invalid collaborator')) {
        toast.error('❌ Noms de collaborateurs invalides trouvés. Veuillez vérifier le format du fichier.');
      } else {
        toast.error(message || 'Erreur lors de l\'upload');
      }
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation du type de fichier
      if (!['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel.sheet.macroEnabled.12'].includes(file.type)) {
        toast.error('Veuillez sélectionner un fichier Excel valide (.xlsx, .xlsm, ou .xls)');
        return;
      }

      setSelectedFile(file);
      setPreview(`${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    uploadMutation.mutate(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-orange-50', 'border-orange-300');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({ target: fileInputRef.current } as any);
      }
    }
  };

  return (
    <PageContainer>
      {/* User Imputation Status */}
      <div className="mb-8">
        <ImputationStatus />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Télécharger un Fichier</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Téléchargez un fichier d'instruction (format XLSX, XLSM ou XLS) pour commencer
        </p>
      </div>

      {/* Upload Area */}
      <Card className="p-12">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="p-12 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg transition cursor-pointer hover:border-attijari-orange dark:hover:border-attijari-orange"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.xlsm"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            className="text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Glissez et déposez votre fichier
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ou cliquez pour parcourir depuis votre ordinateur
            </p>
            <Button variant="outline">Sélectionner un Fichier</Button>
          </div>
        </div>
      </Card>

      {/* File Preview + Actions */}
      {preview && (
        <Card className="mt-6 p-6 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Fichier Sélectionné</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{preview}</p>
              </div>
            </div>

            {selectedFile && (
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="bg-attijari-orange hover:bg-attijari-red min-w-[170px]"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Téléchargement...
                    </>
                  ) : (
                    'Télécharger'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={uploadMutation.isPending}
                  variant="outline"
                >
                  Effacer
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-8 p-6 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Exigences du Fichier</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex gap-2">
            <span className="text-attijari-orange font-bold">•</span>
            <span>Le format du fichier doit être XLSX, XLSM ou XLS</span>
          </li>
          <li className="flex gap-2">
            <span className="text-attijari-orange font-bold">•</span>
            <span>Doit contenir une feuille nommée "Fiche Instruction"</span>
          </li>
          <li className="flex gap-2">
            <span className="text-attijari-orange font-bold">•</span>
            <span>
              Doit suivre le modèle standard de fichier d'instruction Attijariwafa
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-attijari-orange font-bold">•</span>
            <span>
              Les noms des collaborateurs doivent suivre le format : "Collaborateur (Prénom Nom)" ou "Prénom Nom"
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-attijari-orange font-bold">•</span>
            <span>
              Les fichiers dupliqués (par hash) seront automatiquement rejetés
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-yellow-600 font-bold">⚠</span>
            <span>
              Les fichiers avec des noms de collaborateurs incomplets (ex: "Collaborateur 2") seront rejetés
            </span>
          </li>
        </ul>
      </Card>
    </PageContainer>
  );
}
