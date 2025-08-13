import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  History, 
  FileText, 
  Calendar, 
  Clock,
  User,
  Download,
  Upload,
  Edit,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Eye,
  Rewind
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, format } from "date-fns";
import type { EncryptedFile, AuditLog } from "@shared/schema";

export default function HistoryPage() {
  const userId = "demo-user-id"; // In a real app, get from auth context
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const { data: files = [] } = useQuery<EncryptedFile[]>({
    queryKey: ['/api/files', userId],
    enabled: !!userId,
  });

  const { data: auditLogs = [] } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit', userId],
    enabled: !!userId,
  });

  // Group audit logs by file
  const fileActivities = React.useMemo(() => {
    const groups: Record<string, AuditLog[]> = {};
    
    auditLogs.forEach(log => {
      if (log.resourceType === 'file') {
        const key = log.resourceId;
        if (!groups[key]) groups[key] = [];
        groups[key].push(log);
      }
    });

    // Sort activities within each group by date
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    });

    return groups;
  }, [auditLogs]);

  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFileExpansion = (fileId: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedFiles(newExpanded);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload':
        return <Upload className="h-4 w-4 text-success-500" />;
      case 'download':
        return <Download className="h-4 w-4 text-primary-500" />;
      case 'edit':
      case 'update':
        return <Edit className="h-4 w-4 text-warning-500" />;
      case 'share':
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-dark-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'upload':
        return 'bg-success-500/20 text-success-500';
      case 'download':
        return 'bg-primary-500/20 text-primary-500';
      case 'edit':
      case 'update':
        return 'bg-warning-500/20 text-warning-500';
      case 'share':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-dark-600/50 text-dark-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6" data-testid="history-page">
      {/* Header */}
      <div className="bg-dark-800 px-6 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-50">Version History</h2>
            <p className="text-dark-400 mt-1">Track all changes and activities for your files</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <History className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-500 h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-700 border-dark-600 pl-10 pr-4 py-2 text-dark-200 placeholder-dark-500 w-64"
                data-testid="search-input"
              />
            </div>
            
            <Badge variant="secondary" className="bg-primary-500/20 text-primary-500">
              <GitBranch className="h-3 w-3 mr-1" />
              {filteredFiles.length} Files Tracked
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-dark-800 border-dark-700" data-testid="total-files">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Files Tracked</p>
                  <p className="text-2xl font-bold text-dark-50">{files.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700" data-testid="total-versions">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Total Activities</p>
                  <p className="text-2xl font-bold text-dark-50">{auditLogs.filter(log => log.resourceType === 'file').length}</p>
                </div>
                <History className="h-8 w-8 text-success-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700" data-testid="recent-changes">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Recent Changes</p>
                  <p className="text-2xl font-bold text-dark-50">
                    {auditLogs.filter(log => {
                      const logDate = new Date(log.createdAt || 0);
                      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                      return logDate > dayAgo && log.resourceType === 'file';
                    }).length}
                  </p>
                  <p className="text-warning-500 text-sm">Last 24 hours</p>
                </div>
                <Clock className="h-8 w-8 text-warning-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700" data-testid="data-size">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Total Data</p>
                  <p className="text-2xl font-bold text-dark-50">
                    {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                  </p>
                </div>
                <GitBranch className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File History List */}
        <Card className="bg-dark-800 border-dark-700" data-testid="file-history-list">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-primary-500" />
              <span>File Activity Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFiles.length > 0 ? (
              <div className="space-y-4" data-testid="history-entries">
                {filteredFiles.map((file, index) => {
                  const isExpanded = expandedFiles.has(file.id);
                  const activities = fileActivities[file.id] || [];
                  
                  return (
                    <div 
                      key={file.id}
                      className="bg-dark-700 rounded-lg overflow-hidden"
                      data-testid={`file-history-${index}`}
                    >
                      {/* File Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-dark-600 transition-colors"
                        onClick={() => toggleFileExpansion(file.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto"
                              data-testid={`expand-file-${index}`}
                            >
                              {isExpanded ? 
                                <ChevronDown className="h-4 w-4 text-dark-400" /> : 
                                <ChevronRight className="h-4 w-4 text-dark-400" />
                              }
                            </Button>
                            
                            <div className="flex items-center space-x-2">
                              <FileText className="h-5 w-5 text-primary-500" />
                              <div>
                                <h4 className="font-medium text-dark-50" data-testid={`file-name-${index}`}>
                                  {file.originalName}
                                </h4>
                                <div className="flex items-center space-x-3 text-sm text-dark-400">
                                  <span>Version {file.version}</span>
                                  <span>{formatFileSize(file.size)}</span>
                                  <span className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {formatDistanceToNow(new Date(file.updatedAt || 0), { addSuffix: true })}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-success-500/20 text-success-500">
                              {activities.length} activities
                            </Badge>
                            <Badge variant="secondary" className="bg-primary-500/20 text-primary-500">
                              Encrypted
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Activity Timeline */}
                      {isExpanded && (
                        <div className="border-t border-dark-600 p-4">
                          <div className="space-y-3">
                            {activities.length > 0 ? (
                              activities.map((activity, actIndex) => (
                                <div 
                                  key={activity.id}
                                  className="flex items-center justify-between p-3 bg-dark-600 rounded-lg"
                                  data-testid={`activity-${index}-${actIndex}`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                      {getActionIcon(activity.action)}
                                      <Badge variant="secondary" className={getActionColor(activity.action)}>
                                        {activity.action.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-dark-50 font-medium">
                                        {activity.action === 'upload' && 'File uploaded and encrypted'}
                                        {activity.action === 'download' && 'File downloaded and decrypted'}
                                        {activity.action === 'share' && 'Secure sharing link created'}
                                        {activity.action === 'edit' && 'File updated'}
                                      </p>
                                      <div className="flex items-center space-x-3 text-sm text-dark-400">
                                        <span className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{format(new Date(activity.createdAt || 0), 'MMM d, yyyy HH:mm')}</span>
                                        </span>
                                        {activity.ipAddress && (
                                          <span>IP: {activity.ipAddress}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <span className="text-xs font-mono text-dark-500">
                                      {activity.id.slice(0, 8)}...
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <History className="h-8 w-8 text-dark-500 mx-auto mb-2" />
                                <p className="text-dark-400">No recorded activities for this file</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8" data-testid="no-search-results">
                <History className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-50 mb-2">No matching files</h3>
                <p className="text-dark-400">
                  No files found matching "{searchQuery}". Try a different search term.
                </p>
              </div>
            ) : (
              <div className="text-center py-8" data-testid="no-files">
                <History className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-50 mb-2">No files tracked yet</h3>
                <p className="text-dark-400">
                  Upload files to SecureVault and their version history will appear here.
                </p>
                <Button className="mt-4" onClick={() => window.location.href = '/files'}>
                  <Upload className="h-4 w-4 mr-2" />
                  Go to Files
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-primary-500/10 border-primary-500/20" data-testid="version-info">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <GitBranch className="h-5 w-5 text-primary-500 mt-1" />
              <div>
                <h3 className="font-semibold text-primary-500 mb-2">Version History Tracking</h3>
                <p className="text-dark-300 text-sm mb-3">
                  SecureVault automatically tracks all file activities including uploads, downloads, 
                  shares, and modifications. Each action is timestamped and logged for security audit purposes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      <span className="text-dark-300">Automatic version tracking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-dark-300">Encrypted activity logging</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                      <span className="text-dark-300">Timeline view of all changes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-dark-300">IP address and user agent tracking</span>
                    </div>
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