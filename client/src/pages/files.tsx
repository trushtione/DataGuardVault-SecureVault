import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileList } from "@/components/FileList";
import { FileUpload } from "@/components/FileUpload";
import type { EncryptedFile } from "@shared/schema";

export default function FilesPage() {
  const userId = "demo-user-id"; // In a real app, get from auth context
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  const { data: files = [], isLoading } = useQuery<EncryptedFile[]>({
    queryKey: ['/api/files', userId],
    enabled: !!userId,
  });

  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.mimeType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
    // You could also save this preference to localStorage
    localStorage.setItem('fileViewMode', mode);
  };

  // Load saved view mode preference
  React.useEffect(() => {
    const savedViewMode = localStorage.getItem('fileViewMode') as "list" | "grid";
    if (savedViewMode && (savedViewMode === "list" || savedViewMode === "grid")) {
      setViewMode(savedViewMode);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-dark-400">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-dark-900" data-testid="files-page">
      {/* Header */}
      <div className="bg-dark-800 px-4 sm:px-6 py-6 border-b border-dark-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-dark-50">My Files</h2>
            <p className="text-dark-400 mt-1">
              Manage your encrypted files • {viewMode === "list" ? "List View" : "Grid View"}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4 flex-wrap gap-2">
            {/* Search */}
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-500 h-4 w-4" />
              <Input
                placeholder="Search encrypted files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-700 border-dark-600 pl-10 pr-4 py-2 text-dark-200 placeholder-dark-500 focus:border-primary-500 w-full lg:w-80 h-10"
                data-testid="search-input"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-dark-700 border border-dark-600 p-1 h-10">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("list")}
                className={`rounded-r-none transition-all duration-200 h-8 ${
                  viewMode === "list" 
                    ? "bg-primary-600 text-white shadow-sm" 
                    : "text-dark-400 hover:text-dark-200 hover:bg-dark-600"
                }`}
                data-testid="list-view-button"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("grid")}
                className={`rounded-l-none transition-all duration-200 h-8 ${
                  viewMode === "grid" 
                    ? "bg-primary-600 text-white shadow-sm" 
                    : "text-dark-400 hover:text-dark-200 hover:bg-dark-600"
                }`}
                data-testid="grid-view-button"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Filter - Always Visible */}
            <Button 
              variant="outline" 
              size="sm" 
              className="border-dark-600 bg-dark-700 hover:bg-dark-600 text-dark-200 hover:text-dark-100 min-w-[80px] h-10 px-4 flex items-center justify-center flex-shrink-0" 
              data-testid="filter-button"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-8 py-6">
        {/* Upload Area */}
        <FileUpload userId={userId} />

        {/* Files List */}
        <div data-testid="files-list">
          <FileList files={filteredFiles} viewMode={viewMode} />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="text-sm text-dark-400" data-testid="search-results">
            {filteredFiles.length === 0 
              ? `No files found matching "${searchQuery}"`
              : `Found ${filteredFiles.length} file${filteredFiles.length === 1 ? '' : 's'} matching "${searchQuery}"`
            }
          </div>
        )}
      </div>
    </div>
  );
}
