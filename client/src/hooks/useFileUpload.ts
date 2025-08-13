import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CryptoService } from "@/lib/crypto";

interface UploadingFile {
  file: File;
  progress: number;
  status: 'encrypting' | 'uploading' | 'complete' | 'error';
  error?: string;
}

interface UseFileUploadProps {
  userId: string;
  onUploadComplete?: () => void;
}

export function useFileUpload({ userId, onUploadComplete }: UseFileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, encryptedData, metadata }: {
      file: File;
      encryptedData: ArrayBuffer;
      metadata: any;
    }) => {
      const formData = new FormData();
      
      const encryptedBlob = new Blob([encryptedData], { 
        type: file.type || 'application/octet-stream' 
      });
      
      formData.append('file', encryptedBlob, file.name);
      formData.append('userId', userId);
      formData.append('filename', `encrypted_${file.name}`);
      formData.append('originalName', file.name);
      formData.append('mimeType', file.type || 'application/octet-stream');
      formData.append('size', file.size.toString());
      formData.append('checksum', metadata.checksum);
      formData.append('encryptionKey', metadata.key);
      formData.append('iv', metadata.iv);

      return apiRequest('POST', '/api/files', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      onUploadComplete?.();
    },
  });

  const processFile = useCallback(async (file: File) => {
    try {
      setUploadingFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'encrypting', progress: 25 } : f
      ));

      const encryptionResult = await CryptoService.encryptFile(file);

      setUploadingFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'uploading', progress: 75 } : f
      ));

      await uploadMutation.mutateAsync({
        file,
        encryptedData: encryptionResult.encryptedData,
        metadata: {
          key: encryptionResult.key,
          iv: encryptionResult.iv,
          checksum: encryptionResult.checksum,
        },
      });

      setUploadingFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'complete', progress: 100 } : f
      ));

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been encrypted and uploaded securely.`,
      });

    } catch (error: any) {
      setUploadingFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'error', error: error.message } : f
      ));

      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [uploadMutation, toast]);

  const addFiles = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'encrypting' as const,
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);
    acceptedFiles.forEach(processFile);
  }, [processFile]);

  const clearCompleted = useCallback(() => {
    setUploadingFiles(prev => prev.filter(f => f.status !== 'complete'));
  }, []);

  const removeFile = useCallback((file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  }, []);

  return {
    uploadingFiles,
    addFiles,
    clearCompleted,
    removeFile,
    isUploading: uploadMutation.isPending,
  };
}
