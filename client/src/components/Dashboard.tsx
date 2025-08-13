import React from "react";
import { 
  FileText, 
  Shield, 
  HardDrive, 
  CloudUpload,
  TrendingUp,
  Clock,
  Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { FileUpload } from "./FileUpload";
import { FileList } from "./FileList";
import type { EncryptedFile } from "@shared/schema";

interface DashboardProps {
  userId: string;
}

export function Dashboard({ userId }: DashboardProps) {
  const { data: files = [] } = useQuery<EncryptedFile[]>({
    queryKey: ['/api/files', userId],
    enabled: !!userId,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats', userId],
    enabled: !!userId,
  });

  const recentFiles = files
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 5);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const calculateSecurityScore = () => {
    if (!stats) return 0;
    // Simple security score calculation based on encrypted files and usage
    const baseScore = 70;
    const encryptionBonus = (stats as any).totalFiles > 0 ? 20 : 0;
    const usageBonus = (stats as any).totalSize > 0 ? 8 : 0;
    return Math.min(baseScore + encryptionBonus + usageBonus, 98);
  };

  const securityScore = calculateSecurityScore();

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Dashboard Header */}
      <div className="bg-dark-800 px-6 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-50" data-testid="dashboard-title">
              Security Dashboard
            </h2>
            <p className="text-dark-400 mt-1">Monitor your encrypted files and vault security</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Security Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Files Card */}
          <Card className="bg-dark-800 border-dark-700" data-testid="total-files-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Total Files</p>
                  <p className="text-2xl font-bold text-dark-50" data-testid="total-files-count">
                    {(stats as any)?.totalFiles || 0}
                  </p>
                  <p className="text-success-500 text-sm flex items-center mt-1">
                    <Lock className="h-3 w-3 mr-1" />
                    All Encrypted
                  </p>
                </div>
                <div className="bg-primary-500 rounded-lg p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Score Card */}
          <Card className="bg-dark-800 border-dark-700" data-testid="security-score-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Security Score</p>
                  <p className="text-2xl font-bold text-success-500" data-testid="security-score">
                    {securityScore}%
                  </p>
                  <p className="text-dark-400 text-sm">
                    {securityScore >= 90 ? "Excellent" : securityScore >= 70 ? "Good" : "Needs Improvement"}
                  </p>
                </div>
                <div className="bg-success-500 rounded-lg p-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Encrypted Card */}
          <Card className="bg-dark-800 border-dark-700" data-testid="data-encrypted-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Data Encrypted</p>
                  <p className="text-2xl font-bold text-dark-50" data-testid="data-encrypted-size">
                    {stats ? formatFileSize((stats as any).totalSize) : '0 Bytes'}
                  </p>
                  <p className="text-primary-500 text-sm">AES-256</p>
                </div>
                <div className="bg-warning-500 rounded-lg p-3">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Backup Card */}
          <Card className="bg-dark-800 border-dark-700" data-testid="last-backup-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Last Backup</p>
                  <p className="text-lg font-semibold text-dark-50" data-testid="last-backup-time">
                    Never
                  </p>
                  <p className="text-dark-400 text-sm">Auto-backup: OFF</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-3">
                  <CloudUpload className="h-6 w-6 text-primary-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Upload Area */}
        <FileUpload userId={userId} />

        {/* Recent Files Section */}
        {recentFiles.length > 0 && (
          <div>
            <FileList files={recentFiles} />
            {files.length > 5 && (
              <div className="mt-6 text-center">
                <button className="text-primary-500 hover:text-primary-400 font-medium transition-colors">
                  View All Files →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <Card className="bg-dark-800 border-dark-700" data-testid="empty-state">
            <CardContent className="p-8 text-center">
              <HardDrive className="h-12 w-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-50 mb-2">
                Welcome to SecureVault
              </h3>
              <p className="text-dark-400 mb-6">
                Your personal encrypted storage is ready. Upload your first file to get started.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-dark-500">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>AES-256 Encryption</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Lock className="h-4 w-4" />
                  <span>Zero-Knowledge Architecture</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
