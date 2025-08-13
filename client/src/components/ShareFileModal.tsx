import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share, Copy, Calendar, Link, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { EncryptedFile } from "@shared/schema";

interface ShareFileModalProps {
  file: EncryptedFile;
  trigger: React.ReactNode;
}

export function ShareFileModal({ file, trigger }: ShareFileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expiration, setExpiration] = useState<string>("7d");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isShared, setIsShared] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/files/${file.id}/share`, {
        expiresAt: getExpirationDate(expiration)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setShareUrl(data.shareUrl);
      setIsShared(true);
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "File shared successfully",
        description: "Secure sharing link has been generated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to share file",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/files/${file.id}/share`);
      return response.json();
    },
    onSuccess: () => {
      setIsShared(false);
      setShareUrl("");
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Sharing revoked",
        description: "File is no longer shared.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to revoke sharing",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const getExpirationDate = (expiration: string): string | undefined => {
    if (expiration === "never") return undefined;
    
    const now = new Date();
    switch (expiration) {
      case "1h":
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      case "24h":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case "7d":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case "30d":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return undefined;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Sharing link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (isShared) {
      revokeMutation.mutate();
    } else {
      shareMutation.mutate();
    }
  };

  const formatExpiration = (expiration: string): string => {
    switch (expiration) {
      case "1h": return "1 hour";
      case "24h": return "24 hours";
      case "7d": return "7 days";
      case "30d": return "30 days";
      case "never": return "Never";
      default: return expiration;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-dark-800 border-dark-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-dark-50">
            <Share className="h-5 w-5 text-primary-500" />
            <span>Share File</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="p-3 bg-dark-700 rounded-lg">
            <p className="font-medium text-dark-100">{file.originalName}</p>
            <p className="text-sm text-dark-400">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          {/* Expiration Settings */}
          <div className="space-y-2">
            <Label htmlFor="expiration" className="text-dark-200">Link Expiration</Label>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger className="bg-dark-700 border-dark-600 text-dark-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-700 border-dark-600">
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-dark-400">
              Link will expire in {formatExpiration(expiration)}
            </p>
          </div>

          {/* Share/Revoke Button */}
          <Button
            onClick={handleShare}
            disabled={shareMutation.isPending || revokeMutation.isPending}
            className="w-full"
            variant={isShared ? "destructive" : "default"}
          >
            {shareMutation.isPending || revokeMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : isShared ? (
              <Link className="h-4 w-4 mr-2" />
            ) : (
              <Share className="h-4 w-4 mr-2" />
            )}
            {isShared ? "Revoke Sharing" : "Share File"}
          </Button>

          {/* Share URL Display */}
          {isShared && shareUrl && (
            <div className="space-y-3 p-3 bg-dark-700 rounded-lg border border-dark-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-500" />
                <span className="text-sm font-medium text-success-500">File Shared Successfully!</span>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-dark-400">Sharing Link</Label>
                <div className="flex space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-dark-600 border-dark-500 text-dark-200 text-xs"
                  />
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="border-dark-500 text-dark-300 hover:text-dark-100"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {expiration !== "never" && (
                <div className="flex items-center space-x-2 text-xs text-dark-400">
                  <Calendar className="h-3 w-3" />
                  <span>Expires in {formatExpiration(expiration)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
