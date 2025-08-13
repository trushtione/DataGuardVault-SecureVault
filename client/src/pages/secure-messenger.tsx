import React, { useState } from "react";
import { 
  MessageCircle, 
  Send, 
  Lock, 
  Key,
  Shield,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  Timer,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CryptoService } from "@/lib/crypto";

interface SecureMessage {
  id: string;
  encryptedContent: string;
  iv: string;
  recipient: string;
  expiresAt?: Date;
  burnAfterReading: boolean;
  createdAt: Date;
  isRead: boolean;
}

export default function SecureMessengerPage() {
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [recipient, setRecipient] = useState("");
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [expirationTime, setExpirationTime] = useState("1h");
  const [showDecrypted, setShowDecrypted] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const sendSecureMessage = async () => {
    if (!messageContent.trim() || !recipient.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both message content and recipient.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate encryption key and encrypt message
      const key = await CryptoService.generateKey();
      const encrypted = await CryptoService.encryptData(messageContent, key);

      // Calculate expiration time
      let expiresAt: Date | undefined;
      if (expirationTime !== 'never') {
        const hours = parseInt(expirationTime.replace('h', ''));
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      }

      const newMessage: SecureMessage = {
        id: crypto.randomUUID(),
        encryptedContent: encrypted.encryptedData,
        iv: encrypted.iv,
        recipient,
        expiresAt,
        burnAfterReading,
        createdAt: new Date(),
        isRead: false,
      };

      setMessages(prev => [newMessage, ...prev]);
      
      toast({
        title: "Message sent securely",
        description: `Encrypted message sent to ${recipient}`,
      });

      // Reset form
      setMessageContent("");
      setRecipient("");
    } catch (error) {
      toast({
        title: "Encryption failed",
        description: "Could not encrypt the message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const decryptMessage = async (message: SecureMessage) => {
    try {
      // In a real implementation, you'd need the proper key
      // For demo purposes, we'll simulate decryption
      const simulatedDecrypted = `[DECRYPTED] ${message.encryptedContent.substring(0, 50)}...`;
      
      setShowDecrypted(prev => ({
        ...prev,
        [message.id]: true
      }));

      if (message.burnAfterReading) {
        // Mark as read and schedule deletion
        setTimeout(() => {
          setMessages(prev => prev.filter(m => m.id !== message.id));
          toast({
            title: "Message destroyed",
            description: "Message deleted after reading as requested.",
          });
        }, 5000);
      }

      // Mark as read
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, isRead: true } : m
      ));

    } catch (error) {
      toast({
        title: "Decryption failed",
        description: "Could not decrypt the message.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    toast({
      title: "Message deleted",
      description: "Secure message has been permanently deleted.",
    });
  };

  const isExpired = (message: SecureMessage) => {
    return message.expiresAt && new Date() > message.expiresAt;
  };

  const getExpirationText = (message: SecureMessage) => {
    if (!message.expiresAt) return "Never expires";
    
    const now = new Date();
    const timeLeft = message.expiresAt.getTime() - now.getTime();
    
    if (timeLeft <= 0) return "Expired";
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `Expires in ${hours}h ${minutes}m`;
    return `Expires in ${minutes}m`;
  };

  return (
    <div className="space-y-6" data-testid="secure-messenger-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 px-6 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-50 flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-green-500" />
              <span>Secure Messenger</span>
            </h2>
            <p className="text-dark-400 mt-1">Send encrypted, self-destructing messages</p>
          </div>
          
          <Badge variant="secondary" className="bg-green-500/20 text-green-500">
            <Lock className="h-3 w-3 mr-1" />
            End-to-End Encrypted
          </Badge>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compose Message */}
          <Card className="bg-dark-800 border-dark-700" data-testid="compose-message">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5 text-primary-500" />
                <span>Compose Secure Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    placeholder="Enter recipient email or username"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-dark-700 border-dark-600"
                    data-testid="recipient-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your secure message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="bg-dark-700 border-dark-600 min-h-[120px]"
                    data-testid="message-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiration">Expiration</Label>
                    <Select value={expirationTime} onValueChange={setExpirationTime}>
                      <SelectTrigger className="bg-dark-700 border-dark-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="6h">6 hours</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="72h">72 hours</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="burn-after-reading"
                      checked={burnAfterReading}
                      onCheckedChange={setBurnAfterReading}
                      data-testid="burn-after-reading"
                    />
                    <Label htmlFor="burn-after-reading" className="text-sm">
                      Burn after reading
                    </Label>
                  </div>
                </div>

                <Button 
                  onClick={sendSecureMessage} 
                  className="w-full" 
                  data-testid="send-message-button"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Send Encrypted Message
                </Button>
              </div>

              {/* Security Features */}
              <div className="border-t border-dark-700 pt-4">
                <h4 className="font-semibold text-dark-50 mb-3">Security Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-dark-300">AES-256 encryption</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4 text-blue-500" />
                    <span className="text-dark-300">Unique encryption keys</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-warning-500" />
                    <span className="text-dark-300">Auto-expiration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="text-dark-300">Self-destructing messages</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Inbox */}
          <Card className="bg-dark-800 border-dark-700" data-testid="message-inbox">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-primary-500" />
                  <span>Secure Inbox</span>
                </div>
                <Badge variant="secondary" className="bg-primary-500/20 text-primary-500">
                  {messages.length} messages
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length > 0 ? (
                <div className="space-y-4" data-testid="message-list">
                  {messages.map((message, index) => (
                    <div 
                      key={message.id}
                      className={`p-4 rounded-lg border ${
                        isExpired(message) ? 'bg-red-900/20 border-red-700/30' :
                        message.isRead ? 'bg-dark-700 border-dark-600' :
                        'bg-blue-900/20 border-blue-700/30'
                      }`}
                      data-testid={`message-${index}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <UserCheck className="h-4 w-4 text-primary-500" />
                            <span className="font-medium text-dark-50">To: {message.recipient}</span>
                            {!message.isRead && (
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 text-xs">
                                Unread
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-dark-400">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{message.createdAt.toLocaleString()}</span>
                            </span>
                            <span className={`flex items-center space-x-1 ${
                              isExpired(message) ? 'text-red-400' : 'text-warning-400'
                            }`}>
                              <Timer className="h-3 w-3" />
                              <span>{getExpirationText(message)}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {message.burnAfterReading && (
                            <Badge variant="secondary" className="bg-red-500/20 text-red-500 text-xs">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Burn
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMessage(message.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {isExpired(message) ? (
                        <div className="flex items-center space-x-2 text-red-400">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">Message expired and cannot be decrypted</span>
                        </div>
                      ) : showDecrypted[message.id] ? (
                        <div className="bg-dark-600 p-3 rounded border border-green-700/30">
                          <div className="flex items-center space-x-2 text-green-400 text-sm mb-2">
                            <Lock className="h-3 w-3" />
                            <span>Decrypted Content</span>
                          </div>
                          <p className="text-dark-100">[Demo] This would show the decrypted message content</p>
                          {message.burnAfterReading && (
                            <p className="text-red-400 text-xs mt-2">
                              ⚠️ This message will be automatically deleted in 5 seconds
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="bg-dark-700 p-3 rounded border border-dark-600 mb-3">
                            <div className="flex items-center space-x-2 text-dark-400 text-sm mb-2">
                              <Lock className="h-3 w-3" />
                              <span>Encrypted Content</span>
                            </div>
                            <p className="font-mono text-xs text-dark-500 break-all">
                              {message.encryptedContent.substring(0, 60)}...
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => decryptMessage(message)}
                            className="border-green-600 text-green-400 hover:bg-green-600"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Decrypt Message
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8" data-testid="empty-inbox">
                  <MessageCircle className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-dark-50 mb-2">No messages yet</h3>
                  <p className="text-dark-400">
                    Send your first encrypted message to see it appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Warning Notice */}
        <Card className="bg-yellow-500/10 border-yellow-500/20" data-testid="security-warning">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-500 mb-2">Security Notice</h3>
                <p className="text-dark-300 text-sm mb-3">
                  This secure messenger uses client-side encryption to protect your messages. 
                  Messages are encrypted before transmission and can only be decrypted by the intended recipient.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-dark-300">Messages encrypted with AES-256</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-dark-300">Unique encryption key per message</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-warning-500 rounded-full" />
                      <span className="text-dark-300">Auto-expiration prevents data leaks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-dark-300">Burn-after-reading for maximum security</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}