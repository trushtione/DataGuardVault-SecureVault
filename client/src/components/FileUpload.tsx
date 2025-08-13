import React from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Shield, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadProps {
  userId: string;
  onUploadComplete?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'encrypting' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export function FileUpload({ userId, onUploadComplete }: FileUploadProps) {
  const { uploadingFiles, addFiles, clearCompleted, removeFile, isUploading } = useFileUpload({ 
    userId, 
    onUploadComplete 
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const getStatusIcon = (status: UploadingFile['status']) => {
    switch (status) {
      case 'encrypting':
        return <Shield className="h-4 w-4 text-warning-500 animate-spin" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-primary-500 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusText = (status: UploadingFile['status']) => {
    switch (status) {
      case 'encrypting':
        return 'Encrypting...';
      case 'uploading':
        return 'Uploading...';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Failed';
    }
  };

  return (
    <div className="space-y-6">
      {/* Secure File Upload */}
      <div
        {...getRootProps()}
        className={`bg-dark-800 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? "border-primary-500 bg-primary-500/10" 
            : "border-dark-600 hover:border-dark-500"
        }`}
        data-testid="upload-dropzone"
      >
        <input {...getInputProps()} data-testid="file-input" />
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-primary-500 rounded-full p-6">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-dark-50 mb-2">Secure File Upload</h3>
            <p className="text-dark-400 mb-4">
              Drag and drop files here or click to browse. Files are encrypted with AES-256 before upload.
            </p>
            <Button 
              variant="default" 
              size="lg"
              data-testid="browse-files-button"
            >
              <Lock className="mr-2 h-4 w-4" />
              Choose Files to Encrypt
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="bg-dark-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Upload Progress</h3>
          <div className="space-y-4">
            {uploadingFiles.map((uploadingFile, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(uploadingFile.status)}
                    <div>
                      <p className="text-sm font-medium text-dark-200">
                        {uploadingFile.file.name}
                      </p>
                      <p className="text-xs text-dark-400">
                        {(uploadingFile.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    uploadingFile.status === 'complete' ? 'text-success-500' :
                    uploadingFile.status === 'error' ? 'text-destructive-500' :
                    'text-warning-500'
                  }`}>
                    {getStatusText(uploadingFile.status)}
                  </span>
                </div>
                
                <Progress value={uploadingFile.progress} className="h-2" />
                
                {uploadingFile.error && (
                  <p className="text-xs text-destructive-500 mt-1">
                    Error: {uploadingFile.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
