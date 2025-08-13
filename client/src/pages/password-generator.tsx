import React, { useState } from "react";
import { 
  Key, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  CheckCircle,
  Shield,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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

    let newPassword = '';
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    setPassword(newPassword);
  };

  const copyToClipboard = () => {
    if (!password) return;
    
    navigator.clipboard.writeText(password).then(() => {
      toast({
        title: "Password copied",
        description: "The password has been copied to your clipboard.",
      });
    });
  };

  const calculateStrength = () => {
    if (!password) return { score: 0, label: "None", color: "text-dark-500" };
    
    let score = 0;
    if (password.length >= 12) score += 25;
    if (password.length >= 16) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    if (score >= 85) return { score, label: "Very Strong", color: "text-success-500" };
    if (score >= 70) return { score, label: "Strong", color: "text-success-600" };
    if (score >= 50) return { score, label: "Medium", color: "text-warning-500" };
    if (score >= 25) return { score, label: "Weak", color: "text-red-400" };
    return { score, label: "Very Weak", color: "text-red-500" };
  };

  const strength = calculateStrength();

  return (
    <div className="space-y-6" data-testid="password-generator-page">
      {/* Header */}
      <div className="bg-dark-800 px-6 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-50">Password Generator</h2>
            <p className="text-dark-400 mt-1">Generate cryptographically secure passwords</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-success-500" />
            <Badge variant="secondary" className="bg-success-500/20 text-success-500">
              Cryptographically Secure
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Password Output */}
            <Card className="bg-dark-800 border-dark-700" data-testid="password-output">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-primary-500" />
                  <span>Generated Password</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={password}
                    type={showPassword ? "text" : "password"}
                    readOnly
                    placeholder="Click 'Generate' to create a secure password"
                    className="bg-dark-600 border-dark-500 font-mono text-lg"
                    data-testid="generated-password"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="border-dark-600"
                    data-testid="toggle-visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    disabled={!password}
                    className="border-dark-600"
                    data-testid="copy-password"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                {password && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-dark-400">Strength:</span>
                      <span className={`text-sm font-medium ${strength.color}`}>
                        {strength.label}
                      </span>
                      <div className="w-24 h-2 bg-dark-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            strength.score >= 85 ? 'bg-success-500' :
                            strength.score >= 70 ? 'bg-success-600' :
                            strength.score >= 50 ? 'bg-warning-500' :
                            strength.score >= 25 ? 'bg-red-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-dark-400">{password.length} characters</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generation Controls */}
            <Card className="bg-dark-800 border-dark-700" data-testid="generator-settings">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Length Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Password Length</Label>
                    <span className="text-sm text-dark-300">{length} characters</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="128"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer"
                    data-testid="length-slider"
                  />
                  <div className="flex justify-between text-xs text-dark-500">
                    <span>8</span>
                    <span>32</span>
                    <span>64</span>
                    <span>128</span>
                  </div>
                </div>

                {/* Character Type Options */}
                <div className="space-y-4">
                  <Label>Include Characters</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                      <div>
                        <Label htmlFor="uppercase" className="font-medium">Uppercase</Label>
                        <p className="text-sm text-dark-400">A-Z</p>
                      </div>
                      <Switch
                        id="uppercase"
                        checked={includeUppercase}
                        onCheckedChange={setIncludeUppercase}
                        data-testid="include-uppercase"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                      <div>
                        <Label htmlFor="lowercase" className="font-medium">Lowercase</Label>
                        <p className="text-sm text-dark-400">a-z</p>
                      </div>
                      <Switch
                        id="lowercase"
                        checked={includeLowercase}
                        onCheckedChange={setIncludeLowercase}
                        data-testid="include-lowercase"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                      <div>
                        <Label htmlFor="numbers" className="font-medium">Numbers</Label>
                        <p className="text-sm text-dark-400">0-9</p>
                      </div>
                      <Switch
                        id="numbers"
                        checked={includeNumbers}
                        onCheckedChange={setIncludeNumbers}
                        data-testid="include-numbers"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                      <div>
                        <Label htmlFor="symbols" className="font-medium">Symbols</Label>
                        <p className="text-sm text-dark-400">!@#$%^&*</p>
                      </div>
                      <Switch
                        id="symbols"
                        checked={includeSymbols}
                        onCheckedChange={setIncludeSymbols}
                        data-testid="include-symbols"
                      />
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={generatePassword} 
                  className="w-full" 
                  size="lg"
                  data-testid="generate-button"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Generate Secure Password
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Information */}
          <div className="space-y-6">
            {/* Security Features */}
            <Card className="bg-dark-800 border-dark-700" data-testid="security-info">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Shield className="h-5 w-5 text-success-500" />
                  <span>Security Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    <span className="text-dark-300">Cryptographically secure random generation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    <span className="text-dark-300">No password storage or logging</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    <span className="text-dark-300">Client-side generation only</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    <span className="text-dark-300">Real-time strength analysis</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="bg-dark-800 border-dark-700" data-testid="best-practices">
              <CardHeader>
                <CardTitle className="text-lg">Password Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3 text-sm text-dark-400">
                  <div className="border-l-4 border-primary-500 pl-3">
                    <p className="font-medium text-dark-300">Length Matters</p>
                    <p>Use at least 12 characters, preferably 16 or more.</p>
                  </div>
                  <div className="border-l-4 border-warning-500 pl-3">
                    <p className="font-medium text-dark-300">Unique Passwords</p>
                    <p>Use different passwords for each account.</p>
                  </div>
                  <div className="border-l-4 border-success-500 pl-3">
                    <p className="font-medium text-dark-300">Password Manager</p>
                    <p>Store passwords in a secure password manager.</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-3">
                    <p className="font-medium text-dark-300">Avoid Common Words</p>
                    <p>Don't use dictionary words or personal information.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}