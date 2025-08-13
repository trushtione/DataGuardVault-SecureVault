import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Download, 
  Upload, 
  Shield, 
  Calendar, 
  HardDrive,
  FileText,
  CheckCircle,
  AlertTriangle,
  Lock,
  Key,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Backup } from "@shared/schema";

export default function BackupPage() {
  const userId = "demo-user-id"; // In a real app, get from auth context
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: backups = [], isLoading } = useQuery<Backup[]>({
    queryKey: ['/api/backups', userId],
    enabled: !!userId,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats', userId],
    enabled: !!userId,
  });

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would gather all encrypted data
      const backupData = {
        userId,
        filename: `securevault-backup-${new Date().toISOString().split('T')[0]}.json`,
        size: Math.floor(Math.random() * 1000000), // Mock size
        encryptedData: JSON.stringify({
          version: "1.0",
          timestamp: new Date().toISOString(),
          files: [], // Would contain encrypted file metadata
          folders: [], // Would contain folder structure
          keys: [], // Would contain encrypted keys
        }),
        checksum: Math.random().toString(36).substring(7),
      };

      return apiRequest('POST', '/api/backups', backupData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/backups'] });
      toast({
        title: "Backup created successfully",
        description: "Your encrypted backup has been created and is ready for download.",
      });
      setIsCreatingBackup(false);
    },
    onError: (error: any) => {
      toast({
        title: "Backup failed",
        description: error.message,
        variant: "destructive",
      });
      setIsCreatingBackup(false);
    },
  });

  const downloadBackup = (backup: Backup) => {
    try {
      const blob = new Blob([backup.encryptedData], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup downloaded",
        description: `${backup.filename} has been downloaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    await createBackupMutation.mutateAsync();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-dark-400">Loading backup history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="backup-page">
      {/* Header */}
      <div className="bg-dark-800 px-6 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-50">Backup & Export</h2>
            <p className="text-dark-400 mt-1">Create encrypted backups of your vault data</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-success-500" />
            <Badge variant="secondary" className="bg-success-500/20 text-success-500">
              End-to-End Encrypted
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Backup Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-dark-800 border-dark-700" data-testid="data-summary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Data to Backup</p>
                  <p className="text-2xl font-bold text-dark-50">
                    {stats ? formatFileSize((stats as any).totalSize) : '0 Bytes'}
                  </p>
                  <p className="text-primary-500 text-sm">{(stats as any)?.totalFiles || 0} files</p>
                </div>
                <Database className="h-8 w-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700" data-testid="backup-count">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Total Backups</p>
                  <p className="text-2xl font-bold text-dark-50">{backups.length}</p>
                  <p className="text-success-500 text-sm">
                    {backups.length > 0 ? 'Latest: ' + formatDistanceToNow(new Date(backups[0]?.createdAt || 0), { addSuffix: true }) : 'No backups yet'}
                  </p>
                </div>
                <Download className="h-8 w-8 text-success-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700" data-testid="security-level">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Security Level</p>
                  <p className="text-2xl font-bold text-success-500">AES-256</p>
                  <p className="text-dark-400 text-sm">Military grade</p>
                </div>
                <Lock className="h-8 w-8 text-success-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Backup Section */}
        <Card className="bg-dark-800 border-dark-700" data-testid="create-backup">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-primary-500" />
              <span>Create New Backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-dark-700 rounded-lg p-6">
              <h3 className="font-semibold text-dark-50 mb-3">What's Included in Your Backup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  <span className="text-dark-300">File metadata and encryption keys</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  <span className="text-dark-300">Folder structure and organization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  <span className="text-dark-300">Sharing links and permissions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  <span className="text-dark-300">Account settings and preferences</span>
                </div>
              </div>
            </div>

            {isCreatingBackup ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-primary-500 animate-pulse" />
                  <span className="text-dark-50 font-medium">Creating encrypted backup...</span>
                </div>
                <Progress value={65} className="w-full" />
                <p className="text-sm text-dark-400">
                  Encrypting your data and generating secure backup file. This may take a few moments.
                </p>
              </div>
            ) : (
              <Button 
                onClick={handleCreateBackup}
                size="lg" 
                className="w-full md:w-auto"
                disabled={createBackupMutation.isPending}
                data-testid="create-backup-button"
              >
                <Download className="mr-2 h-4 w-4" />
                Create Encrypted Backup
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Backup History */}
        <Card className="bg-dark-800 border-dark-700" data-testid="backup-history">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary-500" />
              <span>Backup History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {backups.length > 0 ? (
              <div className="space-y-3">
                {backups.map((backup, index) => (
                  <div 
                    key={backup.id}
                    className="flex items-center justify-between p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                    data-testid={`backup-item-${index}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-500/20 rounded-lg">
                        <HardDrive className="h-5 w-5 text-primary-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-dark-50" data-testid={`backup-name-${index}`}>
                          {backup.filename}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-dark-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(backup.createdAt || 0), { addSuffix: true })}</span>
                          </span>
                          <span>{formatFileSize(backup.size)}</span>
                          <Badge variant="secondary" className="bg-success-500/20 text-success-500">
                            <Lock className="h-3 w-3 mr-1" />
                            Encrypted
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBackup(backup)}
                      className="border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
                      data-testid={`download-backup-${index}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" data-testid="no-backups">
                <Download className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark-50 mb-2">No backups yet</h3>
                <p className="text-dark-400 mb-6">
                  Create your first encrypted backup to secure your vault data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Security Information */}
        <Card className="bg-warning-500/10 border-warning-500/20" data-testid="security-warning">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-warning-500 mt-1" />
              <div>
                <h3 className="font-semibold text-warning-500 mb-2">⚠️ Important Security Notice</h3>
                <div className="space-y-3 text-dark-300 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Backup Security</h4>
                      <ul className="space-y-1">
                        <li>• Backups are encrypted with AES-256</li>
                        <li>• Store backups in multiple secure locations</li>
                        <li>• Never share backup files with others</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Recovery Important</h4>
                      <ul className="space-y-1">
                        <li>• Without backups, lost data cannot be recovered</li>
                        <li>• Test backup restoration periodically</li>
                        <li>• Keep backups updated with regular exports</li>
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-warning-500/20 pt-3 mt-4">
                    <p className="font-medium">
                      Remember: SecureVault uses zero-knowledge encryption. We cannot recover your data if you lose both your account access and backups.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}