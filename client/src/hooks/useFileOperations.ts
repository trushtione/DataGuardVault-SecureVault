import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { EncryptedFile } from "@shared/schema";

export function useFileOperations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return apiRequest('DELETE', `/api/files/${fileId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trash'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "File moved to trash",
        description: "File has been securely moved to trash.",
      });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return apiRequest('POST', `/api/trash/${fileId}/restore`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trash'] });
      toast({
        title: "File restored",
        description: "File has been restored from trash.",
      });
    },
  });

  const downloadFile = async (file: EncryptedFile) => {
    try {
      toast({
        title: "Download started",
        description: `Decrypting and downloading ${file.originalName}...`,
      });

      // In a real implementation, you would:
      // 1. Fetch the encrypted file data from the server
      // 2. Decrypt it using the stored encryption key
      // 3. Create a blob and download it
      
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await deleteMutation.mutateAsync(fileId);
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const restoreFile = async (fileId: string) => {
    try {
      await restoreMutation.mutateAsync(fileId);
    } catch (error: any) {
      toast({
        title: "Restore failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    deleteFile,
    restoreFile,
    downloadFile,
    deleteMutation,
    restoreMutation,
  };
}
