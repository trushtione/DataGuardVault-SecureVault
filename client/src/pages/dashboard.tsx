import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Folder, 
  Shield, 
  Download, 
  Upload, 
  Trash2, 
  Share2, 
  Activity,
  TrendingUp,
  Users,
  HardDrive,
  FileText,
  Lock,
  Cloud
} from "lucide-react";
import { useLocation } from "wouter";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [userId] = useState("demo-user-id"); // In real app, get from auth context
  
  const {
    stats,
    files,
    trashedFiles,
    fileTypeStats,
    sharedFiles,
    storagePercentage,
    recentActivity,
    formatStorageUsed,
    formatFileSize,
    isLoading
  } = useDashboardData({ userId });

  // Calculate real-time values
  const totalFiles = files.length;
  const totalSize = stats.totalSize;
  const sharedFilesCount = sharedFiles.length;
  const trashedFilesCount = trashedFiles.length;
  
  // Add loading state handling
  if (isLoading) {
    return (
      <div className="min-h-full bg-dark-900 flex items-center justify-center">
        <div className="text-dark-300">Loading dashboard...</div>
      </div>
    );
  }

  // Quick Action Handlers
  const handleUploadFiles = () => {
    setLocation("/files");
  };

  const handleCreateBackup = () => {
    setLocation("/backup");
  };

  const handleShareFiles = () => {
    setLocation("/shared");
  };

  const handleSecurityCheck = () => {
    // Security check functionality can be added here
  };

  return (
    <div className="min-h-full bg-dark-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 px-6 py-8 border-b border-dark-700">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-dark-50 mb-2">Security Dashboard</h1>
          <p className="text-dark-300 text-lg">Monitor your encrypted files and vault security.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Security Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-dark-800 border-dark-700 hover:border-dark-600 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Total Files</p>
                  <p className="text-2xl font-bold text-dark-50">{totalFiles}</p>
                  <p className="text-sm text-green-500">All Encrypted</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700 hover:border-dark-600 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Security Score</p>
                  <p className="text-2xl font-bold text-green-500">98%</p>
                  <p className="text-sm text-green-400 font-medium">Excellent</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700 hover:border-dark-600 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Data Encrypted</p>
                  <p className="text-2xl font-bold text-dark-50">{formatStorageUsed()}</p>
                  <p className="text-sm text-blue-500">AES-256</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Lock className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700 hover:border-dark-600 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">Last Backup</p>
                  <p className="text-2xl font-bold text-dark-50">Never</p>
                  <p className="text-sm text-red-400 font-medium">Auto-backup: OFF</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Storage Overview */}
        <Card className="bg-primary-900/60 border-primary-500/70 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-primary-500" />
              <span className="text-white font-bold text-xl bg-primary-600/20 px-3 py-2 rounded-lg border border-primary-500/30">Storage Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-300">Used Space</span>
              <span className="text-dark-200 font-medium">{formatStorageUsed()} / 5 GB</span>
            </div>
            <Progress value={storagePercentage} className="h-3 bg-dark-700" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-xs text-dark-400">Documents</p>
                <p className="text-lg font-semibold text-dark-100">
                  {formatFileSize(fileTypeStats?.documents?.size || 0)}
                </p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-xs text-dark-400">Images</p>
                <p className="text-lg font-semibold text-dark-100">
                  {formatFileSize(fileTypeStats?.images?.size || 0)}
                </p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-xs text-dark-400">Other</p>
                                <p className="text-lg font-semibold text-dark-100">
                  {formatFileSize(fileTypeStats?.other?.size || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
                    <Card className="bg-warning-900/60 border-warning-500/70 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-warning-500" />
                <span className="text-white font-bold text-xl bg-warning-600/20 px-3 py-2 rounded-lg border border-warning-500/30">Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-dark-200">{activity.action}</p>
                        <p className="text-xs text-dark-400">{activity.file}</p>
                      </div>
                    </div>
                    <span className="text-xs text-dark-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
                    <Card className="bg-success-900/60 border-success-500/70 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-success-500" />
                <span className="text-white font-bold text-xl bg-success-600/20 px-3 py-2 rounded-lg border border-success-500/30">Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleUploadFiles}
                  className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-left cursor-pointer group"
                >
                  <Upload className="h-6 w-6 text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-dark-200">Upload Files</p>
                  <p className="text-xs text-dark-400">Add new files to your vault</p>
                </button>
                
                <button 
                  onClick={handleCreateBackup}
                  className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-left cursor-pointer group"
                >
                  <Download className="h-6 w-6 text-success-500 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-dark-200">Create Backup</p>
                  <p className="text-xs text-dark-400">Backup your important data</p>
                </button>
                
                <button 
                  onClick={handleShareFiles}
                  className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-left cursor-pointer group"
                >
                  <Share2 className="h-6 w-6 text-warning-500 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-dark-200">Share Files</p>
                  <p className="text-xs text-dark-400">Share securely with others</p>
                </button>
                
                <button 
                  onClick={handleSecurityCheck}
                  className="p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-left cursor-pointer group"
                >
                  <Shield className="h-6 w-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-dark-200">Security Check</p>
                  <p className="text-xs text-dark-400">Review security settings</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Status */}
        <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-400 mb-1">Security Status: Excellent</h3>
                <p className="text-black text-sm leading-relaxed font-medium">
                  Your vault is fully secured with AES-256 encryption, two-factor authentication is enabled, 
                  and all recent security checks have passed successfully.
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
