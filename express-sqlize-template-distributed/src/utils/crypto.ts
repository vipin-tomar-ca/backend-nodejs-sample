// Cryptographic utilities for distributed systems

import { createHash, createHmac, randomBytes, createCipher, createDecipher } from 'crypto';

export interface EncryptionOptions {
  algorithm: string;
  key: string;
  iv?: Buffer;
}

export interface HashOptions {
  algorithm: string;
  salt?: string;
  iterations?: number;
}

/**
 * Cryptographic utilities for distributed systems
 */
export class CryptoUtils {
  private static readonly DEFAULT_ALGORITHM = 'aes-256-cbc';
  private static readonly DEFAULT_HASH_ALGORITHM = 'sha256';
  private static readonly DEFAULT_ITERATIONS = 10000;

  /**
   * Generate a secure random string
   */
  static generateRandomString(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random buffer
   */
  static generateRandomBuffer(length: number = 32): Buffer {
    return randomBytes(length);
  }

  /**
   * Hash a string with salt
   */
  static hashString(input: string, options: Partial<HashOptions> = {}): string {
    const algorithm = options.algorithm || this.DEFAULT_HASH_ALGORITHM;
    const salt = options.salt || this.generateRandomString(16);
    const iterations = options.iterations || this.DEFAULT_ITERATIONS;

    let hash = input + salt;
    for (let i = 0; i < iterations; i++) {
      hash = createHash(algorithm).update(hash).digest('hex');
    }

    return `${salt}:${iterations}:${hash}`;
  }

  /**
   * Verify a hashed string
   */
  static verifyHash(input: string, hashedValue: string, options: Partial<HashOptions> = {}): boolean {
    const algorithm = options.algorithm || this.DEFAULT_HASH_ALGORITHM;
    const parts = hashedValue.split(':');
    
    if (parts.length !== 3) {
      return false;
    }

    const [salt, iterationsStr, hash] = parts;
    const iterations = parseInt(iterationsStr, 10);

    const computedHash = this.hashString(input, { algorithm, salt, iterations });
    const computedParts = computedHash.split(':');
    
    return computedParts[2] === hash;
  }

  /**
   * Encrypt data
   */
  static encrypt(data: string, options: EncryptionOptions): string {
    const algorithm = options.algorithm || this.DEFAULT_ALGORITHM;
    const key = Buffer.from(options.key, 'hex');
    const iv = options.iv || this.generateRandomBuffer(16);

    const cipher = createCipher(algorithm, key);
    cipher.setAutoPadding(true);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt data
   */
  static decrypt(encryptedData: string, options: EncryptionOptions): string {
    const algorithm = options.algorithm || this.DEFAULT_ALGORITHM;
    const key = Buffer.from(options.key, 'hex');
    const parts = encryptedData.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = createDecipher(algorithm, key);
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Create HMAC signature
   */
  static createHmacSignature(data: string, secret: string, algorithm: string = 'sha256'): string {
    return createHmac(algorithm, secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  static verifyHmacSignature(data: string, signature: string, secret: string, algorithm: string = 'sha256'): boolean {
    const expectedSignature = this.createHmacSignature(data, secret, algorithm);
    return signature === expectedSignature;
  }

  /**
   * Generate a secure token for distributed systems
   */
  static generateSecureToken(payload: any, secret: string, expiresIn: number = 3600): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const body = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedBody = Buffer.from(JSON.stringify(body)).toString('base64url');
    
    const signature = this.createHmacSignature(
      `${encodedHeader}.${encodedBody}`,
      secret
    );

    return `${encodedHeader}.${encodedBody}.${signature}`;
  }

  /**
   * Verify and decode a secure token
   */
  static verifySecureToken(token: string, secret: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedBody, signature] = parts;
    const expectedSignature = this.createHmacSignature(
      `${encodedHeader}.${encodedBody}`,
      secret
    );

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    const body = JSON.parse(Buffer.from(encodedBody, 'base64url').toString());
    const now = Math.floor(Date.now() / 1000);

    if (body.exp && body.exp < now) {
      throw new Error('Token expired');
    }

    return body;
  }

  /**
   * Generate a deterministic hash for consistent hashing in distributed systems
   */
  static generateConsistentHash(input: string, ringSize: number = 360): number {
    const hash = createHash('md5').update(input).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16);
    return hashValue % ringSize;
  }

  /**
   * Generate a secure session ID
   */
  static generateSessionId(): string {
    return this.generateRandomString(32);
  }

  /**
   * Generate a secure API key
   */
  static generateApiKey(prefix: string = 'api'): string {
    const timestamp = Date.now().toString(36);
    const random = this.generateRandomString(16);
    return `${prefix}_${timestamp}_${random}`;
  }
}
