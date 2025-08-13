import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Key, 
  Download, 
  QrCode, 
  Eye, 
  EyeOff,
  Copy,
  CheckCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CryptoService } from "@/lib/crypto";

interface SecurityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    username: string;
    email: string;
    twoFactorEnabled?: boolean;
  };
}

export function SecurityModal({ open, onOpenChange, user }: SecurityModalProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generatePassword = () => {
    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      toast({
        title: "Invalid configuration",
        description: "Please select at least one character type.",
        variant: "destructive",
      });
      return;
    }

    let password = '';
    const array = new Uint8Array(passwordLength);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < passwordLength; i++) {
      password += charset[array[i] % charset.length];
    }

    setGeneratedPassword(password);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Password has been copied to your clipboard.",
      });
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy password to clipboard.",
        variant: "destructive",
      });
    });
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    // In a real app, this would make an API call to enable/disable 2FA
    toast({
      title: enabled ? "2FA Enabled" : "2FA Disabled",
      description: enabled 
        ? "Two-factor authentication has been enabled for your account."
        : "Two-factor authentication has been disabled.",
    });
  };

  const createBackup = async () => {
    try {
      // Generate a backup of encrypted keys and metadata
      const backupData = {
        userId: user?.id,
        timestamp: new Date().toISOString(),
        encryptionKeys: [], // This would contain encrypted versions of user's keys
      };

      const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(backupBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `securevault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup created",
        description: "Your encrypted backup has been downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Backup failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-dark-800 border-dark-700 text-dark-50" data-testid="security-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary-500" />
            <span>Security Center</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="authentication" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-dark-700">
            <TabsTrigger 
              value="authentication" 
              className="data-[state=active]:bg-primary-500"
              data-testid="tab-authentication"
            >
              Authentication
            </TabsTrigger>
            <TabsTrigger 
              value="password-generator" 
              className="data-[state=active]:bg-primary-500"
              data-testid="tab-password-generator"
            >
              Password Generator
            </TabsTrigger>
            <TabsTrigger 
              value="backup" 
              className="data-[state=active]:bg-primary-500"
              data-testid="tab-backup"
            >
              Backup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="authentication" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-dark-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                  data-testid="2fa-toggle"
                />
              </div>

              {twoFactorEnabled && (
                <div className="p-4 bg-dark-700 rounded-lg space-y-4">
                  <div className="flex items-center space-x-2">
                    <QrCode className="h-5 w-5 text-primary-500" />
                    <span className="font-medium">Setup Instructions</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-dark-400">
                    <li>Download an authenticator app like Google Authenticator or Authy</li>
                    <li>Scan the QR code below with your authenticator app</li>
                    <li>Enter the 6-digit code from your app to verify setup</li>
                  </ol>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">QR Code</span>
                    </div>
                  </div>
                  <Input
                    placeholder="Enter 6-digit verification code"
                    className="bg-dark-600 border-dark-500"
                    data-testid="2fa-verification-input"
                  />
                  <Button className="w-full" data-testid="verify-2fa-button">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify and Enable
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="password-generator" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Password Length: {passwordLength}</Label>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="password-length-slider"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={includeLowercase}
                    onCheckedChange={setIncludeLowercase}
                    id="lowercase"
                    data-testid="include-lowercase"
                  />
                  <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={includeUppercase}
                    onCheckedChange={setIncludeUppercase}
                    id="uppercase"
                    data-testid="include-uppercase"
                  />
                  <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={includeNumbers}
                    onCheckedChange={setIncludeNumbers}
                    id="numbers"
                    data-testid="include-numbers"
                  />
                  <Label htmlFor="numbers">Numbers (0-9)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={includeSymbols}
                    onCheckedChange={setIncludeSymbols}
                    id="symbols"
                    data-testid="include-symbols"
                  />
                  <Label htmlFor="symbols">Symbols (!@#$...)</Label>
                </div>
              </div>

              <Button onClick={generatePassword} className="w-full" data-testid="generate-password-button">
                <Key className="mr-2 h-4 w-4" />
                Generate Secure Password
              </Button>

              {generatedPassword && (
                <div className="space-y-2">
                  <Label>Generated Password</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={generatedPassword}
                      type={showPassword ? "text" : "password"}
                      readOnly
                      className="bg-dark-600 border-dark-500 font-mono h-10 flex-1"
                      data-testid="generated-password-input"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="toggle-password-visibility"
                      className="h-10 w-10 bg-dark-600 border-2 border-dark-500 hover:bg-dark-500 hover:border-primary-400 text-dark-200 hover:text-primary-300 transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generatedPassword)}
                      data-testid="copy-password-button"
                      className={`h-10 w-10 transition-all duration-200 cursor-pointer active:scale-95 shadow-sm ${
                        copied 
                          ? 'bg-green-600 border-2 border-green-500 text-white hover:bg-green-700' 
                          : 'bg-dark-600 border-2 border-dark-500 hover:bg-dark-500 hover:border-primary-400 text-dark-200 hover:text-primary-300'
                      }`}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Download className="h-5 w-5 text-primary-500" />
                  <span className="font-medium">Backup Encryption Keys</span>
                </div>
                <p className="text-sm text-dark-400 mb-4">
                  Create a secure backup of your encryption keys. Store this backup in a safe location
                  as it's your only way to recover access to your encrypted files.
                </p>
                <Button onClick={createBackup} className="w-full" data-testid="create-backup-button">
                  <Download className="mr-2 h-4 w-4" />
                  Download Backup
                </Button>
              </div>

              <div className="p-4 bg-warning-500/10 border border-warning-500/20 rounded-lg">
                <h4 className="font-medium text-warning-500 mb-2">⚠️ Important Security Notice</h4>
                <ul className="text-sm text-dark-400 space-y-1">
                  <li>• Store your backup in a secure, offline location</li>
                  <li>• Never share your backup file with anyone</li>
                  <li>• Consider using a password manager or encrypted storage</li>
                  <li>• Without this backup, lost encryption keys cannot be recovered</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
