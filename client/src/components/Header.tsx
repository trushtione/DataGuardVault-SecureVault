import { Shield, Settings, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  user?: {
    id: string;
    username: string;
    email: string;
  };
  onSecuritySettings?: () => void;
}

export function Header({ user, onSecuritySettings }: HeaderProps) {
  const userInitials = user ? user.username.slice(0, 2).toUpperCase() : "UV";

  return (
    <header className="bg-dark-800 border-b border-dark-700 px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="text-primary-500 h-8 w-8" data-testid="logo-icon" />
            <h1 className="text-2xl font-bold text-dark-50" data-testid="app-title">SecureVault</h1>
          </div>
          <div className="flex items-center space-x-1 bg-success-500 px-3 py-1 rounded-full text-sm font-medium" data-testid="security-badge">
            <Shield className="h-3 w-3" />
            <span>AES-256 Encrypted</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Security Status Indicator */}
          <div className="flex items-center space-x-2 text-sm" data-testid="security-status">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse-success"></div>
            <span className="text-dark-300">Secure Connection</span>
          </div>
          
          {/* User Profile */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-dark-50" data-testid="user-name">{user.username}</div>
                <div className="text-xs text-dark-400" data-testid="user-last-active">Last active: now</div>
              </div>
              
              <Avatar data-testid="user-avatar">
                <AvatarFallback className="bg-primary-500 text-white font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-dark-400 hover:text-dark-200" data-testid="user-menu">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-dark-800 border-dark-700">
                  <DropdownMenuItem 
                    onClick={onSecuritySettings}
                    className="text-dark-300 hover:text-dark-50 hover:bg-dark-700"
                    data-testid="menu-security-settings"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Security Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
