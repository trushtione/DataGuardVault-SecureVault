import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  Shield, 
  Calendar, 
  User, 
  Activity,
  Filter,
  Download,
  Eye,
  Upload,
  Trash2,
  Share
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { AuditLog } from "@shared/schema";

export default function AuditPage() {
  const userId = "demo-user-id"; // In a real app, get from auth context
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit', userId],
    enabled: !!userId,
  });

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resourceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload':
        return <Upload className="h-4 w-4 text-primary-500" />;
      case 'download':
        return <Download className="h-4 w-4 text-success-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'share':
        return <Share className="h-4 w-4 text-warning-500" />;
      case 'login':
        return <User className="h-4 w-4 text-primary-500" />;
      case 'register':
        return <User className="h-4 w-4 text-success-500" />;
      default:
        return <Activity className="h-4 w-4 text-dark-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'upload':
      case 'login':
        return 'bg-primary-500/20 text-primary-500';
      case 'download':
      case 'register':
      case 'restore':
        return 'bg-success-500/20 text-success-500';
      case 'delete':
        return 'bg-red-500/20 text-red-500';
      case 'share':
        return 'bg-warning-500/20 text-warning-500';
      default:
        return 'bg-dark-600/50 text-dark-400';
    }
  };

  const formatActionDescription = (log: AuditLog) => {
    const metadata = log.metadata as any;
    switch (log.action) {
      case 'upload':
        return `Uploaded file "${metadata?.filename}" (${(metadata?.size / (1024 * 1024)).toFixed(1)} MB)`;
      case 'download':
        return `Downloaded file "${metadata?.filename}"`;
      case 'delete':
        return `Deleted file "${metadata?.filename}"`;
      case 'share':
        return `Shared file "${metadata?.filename}"`;
      case 'login':
        return `Logged in from ${log.ipAddress}`;
      case 'register':
        return `Account created with email ${metadata?.email}`;
      case 'restore':
        return `Restored file "${metadata?.filename}" from trash`;
      default:
        return `${log.action} on ${log.resourceType}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-dark-400">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="audit-page">
      {/* Header */}
      <div className="bg-dark-800 px-6 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-50">Audit Logs</h2>
            <p className="text-dark-400 mt-1">Complete activity history and security monitoring</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-500 h-4 w-4" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-700 border-dark-600 pl-10 pr-4 py-2 text-dark-200 placeholder-dark-500 w-64"
                data-testid="search-input"
              />
            </div>
            
            <Button variant="outline" size="sm" className="border-dark-600" data-testid="export-button">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-dark-800 border-dark-700" data-testid="total-activities">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Total Activities</p>
                  <p className="text-2xl font-bold text-dark-50">{auditLogs.length}</p>
                </div>
                <Activity className="h-6 w-6 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700" data-testid="file-uploads">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">File Uploads</p>
                  <p className="text-2xl font-bold text-dark-50">
                    {auditLogs.filter(log => log.action === 'upload').length}
                  </p>
                </div>
                <Upload className="h-6 w-6 text-success-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700" data-testid="downloads">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Downloads</p>
                  <p className="text-2xl font-bold text-dark-50">
                    {auditLogs.filter(log => log.action === 'download').length}
                  </p>
                </div>
                <Download className="h-6 w-6 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700" data-testid="security-events">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Security Events</p>
                  <p className="text-2xl font-bold text-dark-50">
                    {auditLogs.filter(log => ['login', 'register'].includes(log.action)).length}
                  </p>
                </div>
                <Shield className="h-6 w-6 text-warning-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log List */}
        <Card className="bg-dark-800 border-dark-700" data-testid="audit-log-list">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary-500" />
                <span>Activity History</span>
              </CardTitle>
              <Badge variant="secondary" className="bg-success-500/20 text-success-500">
                Real-time Monitoring
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLogs.length > 0 ? (
              <div className="space-y-3" data-testid="log-entries">
                {filteredLogs.slice(0, 20).map((log, index) => (
                  <div 
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                    data-testid={`log-entry-${index}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <Badge variant="secondary" className={getActionColor(log.action)}>
                          {log.action.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium text-dark-50" data-testid={`log-description-${index}`}>
                          {formatActionDescription(log)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-dark-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(log.createdAt || 0), { addSuffix: true })}</span>
                          </span>
                          {log.ipAddress && (
                            <span>IP: {log.ipAddress}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-sm font-mono text-dark-500" data-testid={`log-resource-${index}`}>
                        {log.resourceType}#{log.resourceId.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                ))}
                
                {filteredLogs.length > 20 && (
                  <div className="text-center py-4">
                    <Button variant="ghost" className="text-primary-500">
                      Load More Activities ({filteredLogs.length - 20} remaining)
                    </Button>
                  </div>
                )}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8" data-testid="no-search-results">
                <FileText className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-50 mb-2">No matching activities</h3>
                <p className="text-dark-400">
                  No activities found matching "{searchQuery}". Try a different search term.
                </p>
              </div>
            ) : (
              <div className="text-center py-8" data-testid="no-activities">
                <FileText className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-dark-50 mb-2">No activities yet</h3>
                <p className="text-dark-400">
                  Start using SecureVault and your activities will appear here for security monitoring.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="bg-warning-500/10 border-warning-500/20" data-testid="security-notice">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-warning-500 mt-1" />
              <div>
                <h3 className="font-semibold text-warning-500 mb-2">Security Monitoring</h3>
                <p className="text-dark-300 text-sm mb-3">
                  All activities are logged for security purposes. Audit logs include timestamps, 
                  IP addresses, and action details to help detect unauthorized access.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span className="text-dark-300">Real-time activity logging</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span className="text-dark-300">IP address tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                    <span className="text-dark-300">Detailed action metadata</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-dark-300">Tamper-proof logs</span>
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