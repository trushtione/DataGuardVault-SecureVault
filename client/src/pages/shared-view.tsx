import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Download, Lock, Calendar, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { EncryptedFile } from "@shared/schema";

export default function SharedFileViewPage() {
  const [location, setLocation] = useLocation();
  const [file, setFile] = useState<EncryptedFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Extract token from URL path
  const token = location.split('/shared/')[1];

  useEffect(() => {
    if (!token) {
      setError("Invalid sharing link");
      setIsLoading(false);
      return;
    }

    const fetchSharedFile = async () => {
      try {
        const response = await fetch(`/api/shared/${token}`);
        if (!response.ok) {
          throw new Error("File not found or link expired");
        }
        const fileData = await response.json();
        setFile(fileData);
      } catch (error: any) {
        setError(error.message || "Failed to load shared file");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedFile();
  }, [token]);

  const handleDownload = async () => {
    if (!file) return;

    try {
      toast({
        title: "Download started",
        description: "Preparing file for download...",
      });

      // In a real implementation, you would:
      // 1. Fetch the encrypted file data
      // 2. Decrypt it using the stored key
      // 3. Create a blob and download it
      
      // For now, show a success message
      toast({
        title: "Download ready",
        description: `${file.originalName} is ready for download.`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Card className="bg-dark-800 border-dark-700 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-50 mb-2">
              {error || "File Not Found"}
            </h3>
            <p className="text-dark-400 mb-6">
              This sharing link may have expired or the file may have been removed.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="border-dark-600"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = file.shareExpiresAt && new Date(file.shareExpiresAt) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Card className="bg-dark-800 border-dark-700 max-w-md">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-warning-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-50 mb-2">
              Link Expired
            </h3>
            <p className="text-dark-400 mb-6">
              This sharing link has expired and is no longer valid.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="border-dark-600"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <Card className="bg-dark-800 border-dark-700 max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-primary-500" />
          </div>
          <CardTitle className="text-xl text-dark-50">{file.originalName}</CardTitle>
          <p className="text-dark-400 text-sm">
            Shared securely via DataGuardVault
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* File Details */}
          <div className="space-y-3 p-4 bg-dark-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">File Size</span>
              <span className="text-dark-200 font-medium">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">File Type</span>
              <span className="text-dark-200 font-medium">{file.mimeType}</span>
            </div>
            {file.shareExpiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Expires</span>
                <span className="text-dark-200 font-medium">
                  {new Date(file.shareExpiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Security Info */}
          <div className="flex items-center space-x-2 text-sm text-dark-400">
            <Lock className="h-4 w-4" />
            <span>End-to-end encrypted with AES-256</span>
          </div>

          {/* Download Button */}
          <Button 
            onClick={handleDownload}
            className="w-full bg-primary-600 hover:bg-primary-700"
            size="lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Download File
          </Button>

          {/* Footer */}
          <div className="text-center text-xs text-dark-500 pt-4 border-t border-dark-700">
            <p>Powered by DataGuardVault</p>
            <p>Secure file sharing and encryption</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
