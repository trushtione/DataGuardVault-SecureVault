import React, { useState, useRef } from "react";
import { 
  Image, 
  Upload, 
  Download, 
  Eye,
  EyeOff,
  Shield,
  Lock,
  Key,
  FileText,
  AlertTriangle,
  CheckCircle,
  Layers,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";

export default function SteganographyPage() {
  const [mode, setMode] = useState<'hide' | 'extract'>('hide');
  const [carrierImage, setCarrierImage] = useState<File | null>(null);
  const [carrierPreview, setCarrierPreview] = useState<string>('');
  const [secretMessage, setSecretMessage] = useState('');
  const [password, setPassword] = useState('');
  const [extractedMessage, setExtractedMessage] = useState('');
  const [showExtracted, setShowExtracted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stegoImage, setStegoImage] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.bmp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setCarrierImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setCarrierPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  // LSB Steganography Implementation
  const hideMessageInImage = async () => {
    if (!carrierImage || !secretMessage) {
      toast({
        title: "Missing inputs",
        description: "Please select a carrier image and enter a secret message.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const img = new window.Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Prepare message with password salt and length prefix
        const saltedMessage = password ? `${password}:${secretMessage}` : secretMessage;
        const messageWithLength = saltedMessage.length.toString().padStart(8, '0') + saltedMessage;
        
        // Convert message to binary
        let binaryMessage = '';
        for (let i = 0; i < messageWithLength.length; i++) {
          binaryMessage += messageWithLength.charCodeAt(i).toString(2).padStart(8, '0');
        }
        
        // Add terminator
        binaryMessage += '1111111111111110';

        if (binaryMessage.length > data.length / 4) {
          toast({
            title: "Message too long",
            description: "The message is too long for this image. Try a shorter message or larger image.",
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }

        // Hide message in LSB of red channel
        for (let i = 0; i < binaryMessage.length; i++) {
          const pixelIndex = i * 4; // Red channel
          const bit = parseInt(binaryMessage[i]);
          data[pixelIndex] = (data[pixelIndex] & 0xFE) | bit;
        }

        ctx.putImageData(imageData, 0, 0);
        const stegoImageUrl = canvas.toDataURL('image/png');
        setStegoImage(stegoImageUrl);

        toast({
          title: "Message hidden successfully",
          description: "Your secret message has been embedded in the image using LSB steganography.",
        });
      };

      img.src = carrierPreview;
    } catch (error) {
      toast({
        title: "Steganography failed",
        description: "Could not hide the message in the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const extractMessageFromImage = async () => {
    if (!carrierImage) {
      toast({
        title: "No image selected",
        description: "Please select a steganographic image to extract the message from.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const img = new window.Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Extract binary data from LSB of red channel
        let binaryData = '';
        for (let i = 0; i < data.length; i += 4) {
          binaryData += (data[i] & 1).toString();
        }

        // Extract message length first (8 digits)
        const lengthBinary = binaryData.substring(0, 64); // 8 chars * 8 bits
        let messageLength = 0;
        for (let i = 0; i < 8; i++) {
          const charBinary = lengthBinary.substring(i * 8, (i + 1) * 8);
          const charCode = parseInt(charBinary, 2);
          if (charCode >= 48 && charCode <= 57) { // Valid digit
            messageLength = messageLength * 10 + (charCode - 48);
          }
        }

        if (messageLength > 0 && messageLength < 10000) {
          // Extract the actual message
          const messageBinary = binaryData.substring(64, 64 + messageLength * 8);
          let extractedText = '';
          
          for (let i = 0; i < messageBinary.length; i += 8) {
            const charBinary = messageBinary.substring(i, i + 8);
            if (charBinary.length === 8) {
              const charCode = parseInt(charBinary, 2);
              if (charCode > 0 && charCode < 127) { // Valid ASCII
                extractedText += String.fromCharCode(charCode);
              }
            }
          }

          // Handle password protection
          if (password && extractedText.includes(':')) {
            const parts = extractedText.split(':');
            if (parts[0] === password) {
              setExtractedMessage(parts.slice(1).join(':'));
              toast({
                title: "Message extracted successfully",
                description: "Secret message found and decrypted with correct password.",
              });
            } else {
              toast({
                title: "Incorrect password",
                description: "The password provided does not match the one used to hide the message.",
                variant: "destructive",
              });
              setProcessing(false);
              return;
            }
          } else {
            setExtractedMessage(extractedText);
            toast({
              title: "Message extracted successfully",
              description: `Found hidden message with ${extractedText.length} characters.`,
            });
          }
        } else {
          toast({
            title: "No hidden message found",
            description: "This image does not appear to contain a hidden message, or the message is corrupted.",
            variant: "destructive",
          });
        }
      };

      img.src = carrierPreview;
    } catch (error) {
      toast({
        title: "Extraction failed",
        description: "Could not extract message from the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadStegoImage = () => {
    if (!stegoImage) return;

    const link = document.createElement('a');
    link.download = 'steganographic-image.png';
    link.href = stegoImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Image downloaded",
      description: "The steganographic image has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-full bg-dark-900 pb-8" data-testid="steganography-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 px-6 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-50 flex items-center space-x-2">
              <Image className="h-6 w-6 text-indigo-500" />
              <span>File Steganography</span>
            </h2>
            <p className="text-dark-400 mt-1">Hide secret messages inside images using LSB steganography</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-500">
              <Layers className="h-3 w-3 mr-1" />
              LSB Algorithm
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-500">
              <Zap className="h-3 w-3 mr-1" />
              Advanced
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 pt-6">
        {/* Mode Selection */}
        <Card className="bg-dark-800 border-dark-700" data-testid="mode-selection">
          <CardHeader>
            <CardTitle>Select Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={mode === 'hide' ? 'default' : 'outline'}
                onClick={() => setMode('hide')}
                className="h-20 flex flex-col items-center space-y-2"
                data-testid="hide-mode-button"
              >
                <Eye className="h-6 w-6" />
                <span>Hide Message</span>
              </Button>
              <Button
                variant={mode === 'extract' ? 'default' : 'outline'}
                onClick={() => setMode('extract')}
                className="h-20 flex flex-col items-center space-y-2"
                data-testid="extract-mode-button"
              >
                <EyeOff className="h-6 w-6" />
                <span>Extract Message</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card className="bg-dark-800 border-dark-700" data-testid="image-upload">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-primary-500" />
                  <span>Carrier Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-600 hover:border-dark-500'
                  }`}
                  data-testid="image-dropzone"
                >
                  <input {...getInputProps()} />
                  {carrierPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={carrierPreview} 
                        alt="Carrier" 
                        className="mx-auto max-h-40 rounded-lg"
                      />
                      <p className="text-dark-300">{carrierImage?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Image className="h-12 w-12 text-dark-500 mx-auto" />
                      <div>
                        <p className="text-dark-300">Drop an image here, or click to select</p>
                        <p className="text-dark-500 text-sm">Supports PNG, JPG, JPEG, BMP</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Message Input/Output */}
            {mode === 'hide' ? (
              <Card className="bg-dark-800 border-dark-700" data-testid="message-input">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-success-500" />
                    <span>Secret Message</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="secret-message">Message to Hide</Label>
                    <Textarea
                      id="secret-message"
                      placeholder="Enter your secret message..."
                      value={secretMessage}
                      onChange={(e) => setSecretMessage(e.target.value)}
                      className="bg-dark-700 border-dark-600 min-h-[100px]"
                      data-testid="secret-message-input"
                    />
                    <p className="text-xs text-dark-500 mt-1">
                      {secretMessage.length} characters
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password (Optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password for extra security"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-dark-700 border-dark-600"
                      data-testid="password-input"
                    />
                  </div>

                  <Button
                    onClick={hideMessageInImage}
                    disabled={!carrierImage || !secretMessage || processing}
                    className="w-full"
                    data-testid="hide-message-button"
                  >
                    {processing ? (
                      <>
                        <Layers className="mr-2 h-4 w-4 animate-spin" />
                        Hiding Message...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Hide Message in Image
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-dark-800 border-dark-700" data-testid="message-extraction">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5 text-warning-500" />
                    <span>Extract Hidden Message</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="extract-password">Password (If Used)</Label>
                    <Input
                      id="extract-password"
                      type="password"
                      placeholder="Enter password used during hiding"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-dark-700 border-dark-600"
                      data-testid="extract-password-input"
                    />
                  </div>

                  <Button
                    onClick={extractMessageFromImage}
                    disabled={!carrierImage || processing}
                    className="w-full"
                    data-testid="extract-message-button"
                  >
                    {processing ? (
                      <>
                        <Layers className="mr-2 h-4 w-4 animate-spin" />
                        Extracting Message...
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Extract Hidden Message
                      </>
                    )}
                  </Button>

                  {extractedMessage && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Extracted Message</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowExtracted(!showExtracted)}
                        >
                          {showExtracted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="bg-dark-700 p-4 rounded-lg border border-green-700/30">
                        <p className="text-green-400 text-sm mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Message extracted successfully
                        </p>
                        <div className={`${showExtracted ? '' : 'filter blur-sm'}`}>
                          <p className="text-dark-100 whitespace-pre-wrap">
                            {extractedMessage}
                          </p>
                        </div>
                        <p className="text-xs text-dark-500 mt-2">
                          {extractedMessage.length} characters extracted
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Output/Preview Section */}
          <div className="space-y-6">
            {/* Steganographic Image Preview */}
            {mode === 'hide' && stegoImage && (
              <Card className="bg-dark-800 border-dark-700" data-testid="stego-image-preview">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-success-500" />
                      <span>Steganographic Image</span>
                    </div>
                    <Badge variant="secondary" className="bg-success-500/20 text-success-500">
                      Message Hidden
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <img 
                    src={stegoImage} 
                    alt="Steganographic" 
                    className="w-full rounded-lg"
                  />
                  <Button
                    onClick={downloadStegoImage}
                    variant="outline"
                    className="w-full border-success-500 text-success-400"
                    data-testid="download-stego-button"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Steganographic Image
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Information Panel */}
            <Card className="bg-dark-800 border-dark-700" data-testid="steganography-info">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-indigo-500" />
                  <span>LSB Steganography</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-dark-300">Least Significant Bit (LSB) algorithm</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-dark-300">Invisible to naked eye</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span className="text-dark-300">Password protection support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-dark-300">Works with PNG, JPG, BMP formats</span>
                  </div>
                </div>

                <div className="border-t border-dark-700 pt-4">
                  <h4 className="font-semibold text-dark-50 mb-2">How It Works</h4>
                  <p className="text-dark-400 text-sm leading-relaxed">
                    LSB steganography modifies the least significant bit of each pixel's color channel 
                    to embed your message. This creates imperceptible changes that hide your secret 
                    data within the image file.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Warning */}
            <Card className="bg-yellow-500/10 border-yellow-500/20" data-testid="security-warning">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-500 mb-2">Security Notice</h3>
                    <p className="text-dark-300 text-sm mb-3">
                      Steganography provides security through obscurity. For maximum protection, 
                      combine with encryption and use password protection.
                    </p>
                    <ul className="text-sm text-dark-400 space-y-1">
                      <li>• Avoid compression that may destroy hidden data</li>
                      <li>• Use high-quality images for better capacity</li>
                      <li>• Keep original images secure and private</li>
                      <li>• Consider additional encryption for sensitive data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}