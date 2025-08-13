import { 
  FileText, 
  FileImage, 
  File,
  Lock,
  Calendar,
  HardDrive
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { EncryptedFile } from "@shared/schema";

export const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.includes('pdf')) return FileText;
  return File;
};

export const getFileIconColor = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return "text-warning-500";
  if (mimeType.includes('pdf')) return "text-red-500";
  return "text-primary-500";
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileDetails = (file: EncryptedFile) => {
  const FileIcon = getFileIcon(file.mimeType);
  const iconColor = getFileIconColor(file.mimeType);
  const formattedSize = formatFileSize(file.size);
  const formattedDate = formatDistanceToNow(new Date(file.updatedAt || 0), { addSuffix: true });

  return {
    FileIcon,
    iconColor,
    formattedSize,
    formattedDate,
  };
};

export const getFileTypeStats = (files: EncryptedFile[]) => {
  const documents = files.filter(f => f.mimeType?.includes('pdf') || f.mimeType?.includes('doc'));
  const images = files.filter(f => f.mimeType?.includes('image'));
  const other = files.filter(f => !f.mimeType?.includes('pdf') && !f.mimeType?.includes('doc') && !f.mimeType?.includes('image'));

  return {
    documents: {
      count: documents.length,
      size: documents.reduce((acc, f) => acc + (f.size || 0), 0),
    },
    images: {
      count: images.length,
      size: images.reduce((acc, f) => acc + (f.size || 0), 0),
    },
    other: {
      count: other.length,
      size: other.reduce((acc, f) => acc + (f.size || 0), 0),
    },
  };
};
