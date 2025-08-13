// Client-side encryption utilities using Web Crypto API
export class CryptoService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  // Generate a random encryption key
  static async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  // Generate a random IV
  static generateIV(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
  }

  // Encrypt data
  static async encrypt(data: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
    return await window.crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      data
    );
  }

  // Decrypt data
  static async decrypt(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
    return await window.crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encryptedData
    );
  }

  // Export key to raw format
  static async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
    return await window.crypto.subtle.exportKey('raw', key);
  }

  // Import key from raw format
  static async importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    return await window.crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Derive key from password using PBKDF2
  static async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Generate salt for password derivation
  static generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(16));
  }

  // Calculate SHA-256 hash for integrity checking
  static async calculateHash(data: ArrayBuffer): Promise<ArrayBuffer> {
    return await window.crypto.subtle.digest('SHA-256', data);
  }

  // Convert ArrayBuffer to hex string
  static arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Convert hex string to ArrayBuffer
  static hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  // Encrypt a file
  static async encryptFile(file: File, password?: string): Promise<{
    encryptedData: ArrayBuffer;
    key: string;
    iv: string;
    checksum: string;
  }> {
    // Generate or derive encryption key
    let key: CryptoKey;
    if (password) {
      const salt = this.generateSalt();
      key = await this.deriveKeyFromPassword(password, salt);
    } else {
      key = await this.generateKey();
    }

    // Generate IV
    const iv = this.generateIV();

    // Read file data
    const fileBuffer = await file.arrayBuffer();

    // Calculate checksum of original file
    const checksumBuffer = await this.calculateHash(fileBuffer);
    const checksum = this.arrayBufferToHex(checksumBuffer);

    // Encrypt the file
    const encryptedData = await this.encrypt(fileBuffer, key, iv);

    // Export key for storage
    const exportedKey = await this.exportKey(key);

    return {
      encryptedData,
      key: this.arrayBufferToHex(exportedKey),
      iv: this.arrayBufferToHex(iv.buffer),
      checksum,
    };
  }

  // Decrypt a file
  static async decryptFile(
    encryptedData: ArrayBuffer,
    keyHex: string,
    ivHex: string
  ): Promise<ArrayBuffer> {
    // Import key
    const keyBuffer = this.hexToArrayBuffer(keyHex);
    const key = await this.importKey(keyBuffer);

    // Convert IV
    const iv = new Uint8Array(this.hexToArrayBuffer(ivHex));

    // Decrypt the data
    return await this.decrypt(encryptedData, key, iv);
  }

  // Verify file integrity
  static async verifyFileIntegrity(data: ArrayBuffer, expectedChecksum: string): Promise<boolean> {
    const actualChecksumBuffer = await this.calculateHash(data);
    const actualChecksum = this.arrayBufferToHex(actualChecksumBuffer);
    return actualChecksum === expectedChecksum;
  }
}
