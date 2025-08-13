import { useQuery } from "@tanstack/react-query";
import { getFileTypeStats } from "@/lib/fileUtils";

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  totalEncryptedSize: number;
}

interface UseDashboardDataProps {
  userId: string;
}

export function useDashboardData({ userId }: UseDashboardDataProps) {
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

  const { data: backups = [] } = useQuery<any[]>({
    queryKey: ['/api/backups', userId],
    enabled: !!userId,
  });

  const fileTypeStats = getFileTypeStats(files);
  const sharedFiles = files.filter((file: any) => file.isShared);
  const storagePercentage = stats ? Math.round(((stats.totalSize / (5 * 1024 * 1024 * 1024)) * 100)) : 0;
  
  // Provide default values when data is loading
  const safeStats = stats || { totalFiles: 0, totalSize: 0, totalEncryptedSize: 0 };

  const recentActivity = [
    {
      action: "File uploaded",
      file: "document.pdf",
      time: "2 minutes ago"
    },
    {
      action: "File shared",
      file: "image.jpg",
      time: "15 minutes ago"
    },
    {
      action: "Backup created",
      file: "backup.zip",
      time: "1 hour ago"
    }
  ];

  const formatStorageUsed = () => {
    if (!stats) return "0 MB / 5 GB";
    const usedMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
    return `${usedMB} MB / 5 GB`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    stats: safeStats,
    files,
    trashedFiles,
    backups,
    fileTypeStats,
    sharedFiles,
    storagePercentage,
    recentActivity,
    formatStorageUsed,
    formatFileSize,
    isLoading: !stats && !files && !trashedFiles,
  };
}
