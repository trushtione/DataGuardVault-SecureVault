import { 
  Home, 
  Folder, 
  Share, 
  History, 
  Trash2, 
  Key, 
  FileText, 
  Download, 
  Database,
  HardDrive,
  Brain,
  MessageCircle,
  Image
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { useStorageStats } from "@/hooks/useStorageStats";

interface SidebarProps {
  userId?: string;
}

export function Sidebar({ userId }: SidebarProps) {
  const [location] = useLocation();
  const { stats, files, trashedFiles, sharedFiles, storagePercentage } = useStorageStats({ userId });

  const navigationItems = [
    { href: "/", icon: Home, label: "Dashboard", active: location === "/" },
    { href: "/files", icon: Folder, label: "My Files", count: files.length },
    { href: "/shared", icon: Share, label: "Shared Files", count: sharedFiles.length },
    { href: "/history", icon: History, label: "Version History" },
    { href: "/trash", icon: Trash2, label: "Secure Trash", count: trashedFiles.length, variant: "warning" },
  ];

  const securityTools = [
    { href: "/password-generator", icon: Key, label: "Password Generator" },
    { href: "/audit", icon: FileText, label: "Audit Logs" },
    { href: "/backup", icon: Download, label: "Backup & Export" },
  ];

  const advancedFeatures = [
    { href: "/ai-insights", icon: Brain, label: "AI Security Insights" },
    { href: "/secure-messenger", icon: MessageCircle, label: "Secure Messenger" },
    { href: "/steganography", icon: Image, label: "File Steganography" },
  ];

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col h-full" data-testid="sidebar">
      {/* Main Navigation */}
      <div className="flex-1 p-6 overflow-y-auto">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${
                item.active
                  ? "bg-primary-500 text-white"
                  : "text-dark-300 hover:text-white hover:bg-dark-700"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span 
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.variant === "warning" 
                      ? "bg-warning-500 text-dark-900" 
                      : "bg-dark-600 text-dark-300"
                  }`}
                  data-testid={`count-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-dark-700">
          <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-4">
            Security Tools
          </h3>
          <nav className="space-y-2">
            {securityTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex items-center space-x-3 px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                data-testid={`tool-${tool.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <tool.icon className="h-5 w-5" />
                <span>{tool.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-dark-700">
          <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-4">
            Advanced Features
          </h3>
          <nav className="space-y-2">
            {advancedFeatures.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="flex items-center space-x-3 px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                data-testid={`feature-${feature.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <feature.icon className="h-5 w-5" />
                <span>{feature.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Storage Usage - Fixed at bottom with better contrast */}
      <div className="p-6 border-t border-dark-700 bg-dark-800/50">
        <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg p-4 border border-dark-600/50" data-testid="storage-usage">
          <div className="flex items-center space-x-2 mb-3">
            <HardDrive className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-dark-200">Storage Usage</span>
          </div>
          <Progress 
            value={storagePercentage} 
            className="mb-3 h-2 bg-dark-600"
            data-testid="storage-progress"
          />
          <div className="text-xs text-dark-300">
            <span data-testid="storage-used" className="text-primary-300 font-medium">
              {stats ? `${((stats as any).totalSize / (1024 * 1024)).toFixed(1)} MB` : '0 MB'}
            </span> of{" "}
            <span data-testid="storage-total" className="text-dark-200">5 GB</span> used
          </div>
        </div>
      </div>
    </aside>
  );
}
