import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Trash2, 
  ArchiveRestore, 
  AlertTriangle, 
  Shield,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileList } from "@/components/FileList";
import type { EncryptedFile } from "@shared/schema";

export default function TrashPage() {
  const userId = "demo-user-id"; // In a real app, get from auth context

  const { data: deletedFiles = [], isLoading } = useQuery<EncryptedFile[]>({
    queryKey: ['/api/trash', userId],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-dark-400">Loading deleted files...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="trash-page">
      {/* Header */}
      <div className="bg-dark-800 px-6 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-50">Secure Trash</h2>
            <p className="text-dark-400 mt-1">Securely deleted files - recoverable for 30 days</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-warning-500/20 text-warning-500">
              <Clock className="h-3 w-3 mr-1" />
              Auto-delete in 30 days
            </Badge>
            <div className="flex items-center space-x-2 text-sm">
              <Trash2 className="h-4 w-4 text-warning-500" />
              <span className="text-dark-300">{deletedFiles.length} deleted files</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Security Notice */}
        <Card className="bg-dark-800 border-dark-700" data-testid="security-notice">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Shield className="h-5 w-5 text-primary-500" />
              <span>Secure Deletion Process</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-dark-400">
              Deleted files remain encrypted and are securely stored in trash for 30 days. 
              After this period, files and their encryption keys are permanently destroyed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span className="text-dark-300">Encryption maintained</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                <span className="text-dark-300">30-day recovery window</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-dark-300">Secure key destruction</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {deletedFiles.length > 0 && (
          <Card className="bg-dark-800 border-dark-700" data-testid="bulk-actions">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-warning-500" />
                  <span className="text-sm text-dark-300">
                    {deletedFiles.length} file{deletedFiles.length === 1 ? '' : 's'} in trash
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-success-500 text-success-500 hover:bg-success-500 hover:text-white"
                    data-testid="restore-all-button"
                  >
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Restore All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    data-testid="empty-trash-button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Empty Trash
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deleted Files List */}
        {deletedFiles.length > 0 ? (
          <div data-testid="deleted-files-list">
            <FileList files={deletedFiles} showDeleted={true} />
          </div>
        ) : (
          <Card className="bg-dark-800 border-dark-700" data-testid="empty-trash">
            <CardContent className="p-8 text-center">
              <Trash2 className="h-12 w-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-50 mb-2">
                Trash is empty
              </h3>
              <p className="text-dark-400 mb-6">
                Deleted files will appear here and can be restored within 30 days.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-dark-500">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Secure deletion</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>30-day recovery</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deletion Timeline */}
        {deletedFiles.length > 0 && (
          <Card className="bg-dark-800 border-dark-700" data-testid="deletion-timeline">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Clock className="h-5 w-5 text-warning-500" />
                <span>Deletion Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deletedFiles
                  .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime())
                  .slice(0, 5)
                  .map((file) => {
                    const deletedDate = new Date(file.deletedAt!);
                    const expiryDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                    const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
                    
                    return (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
                        data-testid={`timeline-item-${file.id}`}
                      >
                        <div>
                          <p className="font-medium text-dark-50">{file.originalName}</p>
                          <p className="text-sm text-dark-400">
                            Deleted {deletedDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            daysLeft <= 7 ? 'text-red-400' : 
                            daysLeft <= 14 ? 'text-warning-500' : 
                            'text-dark-300'
                          }`}>
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                          </p>
                          <p className="text-xs text-dark-500">
                            Auto-delete: {expiryDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {deletedFiles.length > 5 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" className="text-primary-500">
                    View all {deletedFiles.length} deleted files →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
