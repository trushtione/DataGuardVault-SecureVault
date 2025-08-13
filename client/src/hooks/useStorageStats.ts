import { useQuery } from "@tanstack/react-query";

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  totalEncryptedSize: number;
}

interface UseStorageStatsProps {
  userId?: string;
}

export function useStorageStats({ userId }: UseStorageStatsProps) {
  const { data: stats } = useQuery<StorageStats>({
    queryKey: ['/api/stats', userId],
    enabled: !!userId,
  });

  const { data: files = [] } = useQuery<any[]>({
    queryKey: ['/api/files', userId],
    enabled: !!userId,
  });

  const { data: trashedFiles = [] } = useQuery<any[]>({
    queryKey: ['/api/trash', userId],
    enabled: !!userId,
  });

  const sharedFiles = files.filter((file: any) => file.isShared);
  const storagePercentage = stats ? Math.round(((stats.totalSize / (5 * 1024 * 1024 * 1024)) * 100)) : 0;

  return {
    stats,
    files,
    trashedFiles,
    sharedFiles,
    storagePercentage,
    isLoading: !stats && !files && !trashedFiles,
  };
}
