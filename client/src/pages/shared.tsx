import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Share, ExternalLink, Calendar, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileList } from "@/components/FileList";
import type { EncryptedFile } from "@shared/schema";
import { ShareFileModal } from "@/components/ShareFileModal";
import { useToast } from "@/hooks/use-toast";

export default function SharedPage() {
  const userId = "demo-user-id"; // In a real app, get from auth context
  const { toast } = useToast();

  const { data: files = [], isLoading } = useQuery<EncryptedFile[]>({
    queryKey: ['/api/files', userId],
    enabled: !!userId,
  });

  const sharedFiles = files.filter(file => file.isShared);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-dark-400">Loading shared files...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="shared-page">
      {/* Header */}
      <div className="bg-dark-800 px-6 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-50">Shared Files</h2>
            <p className="text-dark-400 mt-1">Files you've shared with secure links</p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Share className="h-4 w-4 text-primary-500" />
            <span className="text-dark-300">{sharedFiles.length} files shared</span>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Sharing Instructions */}
        <Card className="bg-dark-800 border-dark-700" data-testid="sharing-info">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Share className="h-5 w-5 text-primary-500" />
              <span>Secure File Sharing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-dark-400">
              Share your encrypted files securely with time-limited, encrypted links. Recipients don't need an account to access shared files.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span className="text-dark-300">End-to-end encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-dark-300">Time-limited access</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                <span className="text-dark-300">Revokable anytime</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shared Files List */}
        {sharedFiles.length > 0 ? (
          <div data-testid="shared-files-list">
            <FileList files={sharedFiles} showShared={true} />
          </div>
        ) : (
          <Card className="bg-dark-800 border-dark-700" data-testid="no-shared-files">
            <CardContent className="p-8 text-center">
              <Share className="h-12 w-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-50 mb-2">
                No shared files yet
              </h3>
              <p className="text-dark-400 mb-6">
                Share your encrypted files with others using secure, time-limited links.
              </p>
              <Button 
                variant="outline" 
                className="border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
                onClick={() => window.location.href = '/files'}
              >
                <Share className="mr-2 h-4 w-4" />
                Go to Files
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Shares Summary */}
        {sharedFiles.length > 0 && (
          <Card className="bg-dark-800 border-dark-700" data-testid="shares-summary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Calendar className="h-5 w-5 text-warning-500" />
                <span>Active Shares</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sharedFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
                    data-testid={`share-summary-${file.id}`}
                  >
                    <div>
                      <p className="font-medium text-dark-50">{file.originalName}</p>
                      <p className="text-sm text-dark-400">
                        Shared {file.shareExpiresAt 
                          ? `• Expires ${new Date(file.shareExpiresAt).toLocaleDateString()}`
                          : '• No expiration'
                        }
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-dark-600"
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/shared/${file.shareToken}`;
                          navigator.clipboard.writeText(shareUrl);
                          toast({
                            title: "Link copied",
                            description: "Sharing link copied to clipboard.",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <ShareFileModal
                        file={file}
                        trigger={
                          <Button variant="outline" size="sm" className="border-dark-600">
                            <Share className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
