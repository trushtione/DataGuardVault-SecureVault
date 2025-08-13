import React from "react";
import { 
  FileText, 
  Download, 
  Share, 
  Trash2, 
  FileImage, 
  File, 
  Lock,
  MoreVertical,
  Calendar,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ShareFileModal } from "./ShareFileModal";
import { useFileOperations } from "@/hooks/useFileOperations";
import { getFileDetails } from "@/lib/fileUtils";
import type { EncryptedFile } from "@shared/schema";

interface FileListProps {
  files: EncryptedFile[];
  showShared?: boolean;
  showDeleted?: boolean;
  viewMode?: "list" | "grid";
}

export function FileList({ files, showShared = false, showDeleted = false, viewMode = "list" }: FileListProps) {
  const { deleteFile, restoreFile, downloadFile, deleteMutation, restoreMutation } = useFileOperations();

  if (files.length === 0) {
    return (
      <div className="bg-dark-800 rounded-xl p-8 border border-dark-700 text-center" data-testid="empty-file-list">
        <File className="h-12 w-12 text-dark-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-dark-50 mb-2">
          {showDeleted ? "No deleted files" : "No files yet"}
        </h3>
        <p className="text-dark-400">
          {showDeleted 
            ? "Your deleted files will appear here." 
            : "Upload your first file to get started with secure storage."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700" data-testid="file-list">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-dark-50">
          {showDeleted ? "Deleted Files" : showShared ? "Shared Files" : "Recent Files"}
        </h3>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-dark-400 hover:text-dark-200" data-testid="filter-button">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
        {files.map((file) => {
          const { FileIcon, iconColor, formattedSize, formattedDate } = getFileDetails(file);

          if (viewMode === "grid") {
            // Grid View - Card Layout
            return (
              <div
                key={file.id}
                className="bg-dark-700 rounded-lg p-4 hover:bg-dark-600 transition-colors border border-dark-600 hover:border-dark-500"
                data-testid={`file-item-${file.id}`}
              >
                <div className="flex flex-col space-y-3">
                  {/* File Icon and Type */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-dark-600 ${iconColor}`}>
                      <FileIcon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="bg-success-500/20 text-success-500 text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Encrypted
                    </Badge>
                  </div>

                  {/* File Name */}
                  <div>
                    <h4 className="font-medium text-dark-50 text-sm leading-tight" data-testid={`file-name-${file.id}`}>
                      {file.originalName}
                    </h4>
                  </div>

                  {/* File Details */}
                  <div className="space-y-2 text-xs text-dark-400">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-3 w-3" />
                      <span data-testid={`file-size-${file.id}`}>{formattedSize}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span data-testid={`file-modified-${file.id}`}>
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-dark-600">
                    {!showDeleted ? (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(file)}
                          className="text-dark-400 hover:text-primary-500 h-8 w-8 p-0"
                          data-testid={`download-${file.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <ShareFileModal
                          file={file}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-dark-400 hover:text-primary-500 h-8 w-8 p-0"
                              data-testid={`share-${file.id}`}
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                          className="text-dark-400 hover:text-warning-500 h-8 w-8 p-0"
                          disabled={deleteMutation.isPending}
                          data-testid={`delete-${file.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreFile(file.id)}
                        className="text-dark-400 hover:text-success-500 h-8 px-3"
                        disabled={restoreMutation.isPending}
                        data-testid={`restore-${file.id}`}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          } else {
            // List View - Original Layout
            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                data-testid={`file-item-${file.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg bg-dark-600 ${iconColor}`}>
                    <FileIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-dark-50" data-testid={`file-name-${file.id}`}>
                      {file.originalName}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-dark-400">
                      <span className="flex items-center space-x-1">
                        <HardDrive className="h-3 w-3" />
                        <span data-testid={`file-size-${file.id}`}>{formattedSize}</span>
                      </span>
                      <Badge variant="secondary" className="bg-success-500/20 text-success-500 hover:bg-success-500/30">
                        <Lock className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span data-testid={`file-modified-${file.id}`}>
                          {formattedDate}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!showDeleted ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(file)}
                        className="text-dark-400 hover:text-primary-500"
                        data-testid={`download-${file.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <ShareFileModal
                        file={file}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-dark-400 hover:text-primary-500"
                            data-testid={`share-${file.id}`}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFile(file.id)}
                        className="text-dark-400 hover:text-warning-500"
                        disabled={deleteMutation.isPending}
                        data-testid={`delete-${file.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => restoreFile(file.id)}
                      className="text-dark-400 hover:text-success-500"
                      disabled={restoreMutation.isPending}
                      data-testid={`restore-${file.id}`}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
