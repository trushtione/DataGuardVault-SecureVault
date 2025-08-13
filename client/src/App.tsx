import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SecurityModal } from "@/components/SecurityModal";
import { localStorage } from "@/lib/storage";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard";
import FilesPage from "@/pages/files";
import SharedPage from "@/pages/shared";
import SharedFileViewPage from "@/pages/shared-view";
import TrashPage from "@/pages/trash";
import PasswordGeneratorPage from "@/pages/password-generator";
import AuditPage from "@/pages/audit";
import BackupPage from "@/pages/backup";
import HistoryPage from "@/pages/history";
import AIInsightsPage from "@/pages/ai-insights";
import SecureMessengerPage from "@/pages/secure-messenger";
import SteganographyPage from "@/pages/steganography";

function Router({ userId, onSecurityModalOpen }: { userId: string; onSecurityModalOpen: () => void }) {
  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar userId={userId} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/files" component={FilesPage} />
            <Route path="/shared" component={SharedPage} />
            <Route path="/shared/:id" component={SharedFileViewPage} />
            <Route path="/trash" component={TrashPage} />
            <Route path="/password-generator" component={PasswordGeneratorPage} />
            <Route path="/audit" component={AuditPage} />
            <Route path="/backup" component={BackupPage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/ai-insights" component={AIInsightsPage} />
            <Route path="/secure-messenger" component={SecureMessengerPage} />
            <Route path="/steganography" component={SteganographyPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  
  // Mock user for demo - in real app this would come from authentication
  const user = {
    id: "demo-user-id",
    username: "Alex Morgan",
    email: "alex.morgan@example.com",
    twoFactorEnabled: false,
  };

  useEffect(() => {
    // Initialize local storage
    const initStorage = async () => {
      try {
        await localStorage.init();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize local storage:", error);
        setIsInitialized(true); // Still allow the app to load
      }
    };

    initStorage();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-dark-300">Initializing secure storage...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-dark-900 font-inter text-dark-50 flex flex-col">
          <Header 
            user={user} 
            onSecuritySettings={() => setSecurityModalOpen(true)} 
          />
          <div className="flex-1 overflow-hidden">
            <Router 
              userId={user.id} 
              onSecurityModalOpen={() => setSecurityModalOpen(true)} 
            />
          </div>
          <SecurityModal
            open={securityModalOpen}
            onOpenChange={setSecurityModalOpen}
            user={user}
          />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
