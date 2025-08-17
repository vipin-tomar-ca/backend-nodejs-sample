// Serialization utilities for distributed systems

import { createHash } from 'crypto';
import { gzipSync, gunzipSync } from 'zlib';

export interface SerializationOptions {
  compress?: boolean;
  encrypt?: boolean;
  format?: 'json' | 'msgpack' | 'protobuf';
  version?: string;
}

export interface SerializedData {
  data: string | Buffer;
  metadata: {
    version: string;
    format: string;
    compressed: boolean;
    encrypted: boolean;
    timestamp: number;
    checksum?: string;
  };
}

/**
 * Serialization utilities for distributed systems
 */
export class SerializationUtils {
  private static readonly DEFAULT_VERSION = '1.0.0';
  private static readonly DEFAULT_FORMAT = 'json';

  /**
   * Serialize data for distributed transmission
   */
  static serialize<T>(data: T, options: SerializationOptions = {}): SerializedData {
    const format = options.format || this.DEFAULT_FORMAT;
    const version = options.version || this.DEFAULT_VERSION;
    const timestamp = Date.now();

    let serializedData: string | Buffer;
    let checksum: string | undefined;

    // Serialize based on format
    switch (format) {
      case 'json':
        serializedData = JSON.stringify(data);
        break;
      case 'msgpack':
        // Note: In a real implementation, you would use a msgpack library
        serializedData = JSON.stringify(data); // Fallback to JSON
        break;
      case 'protobuf':
        // Note: In a real implementation, you would use protobuf
        serializedData = JSON.stringify(data); // Fallback to JSON
        break;
      default:
        serializedData = JSON.stringify(data);
    }

    // Generate checksum
    checksum = this.generateChecksum(serializedData);

    // Compress if requested
    if (options.compress) {
      serializedData = this.compress(serializedData);
    }

    // Encrypt if requested
    if (options.encrypt) {
      serializedData = this.encrypt(serializedData);
    }

    return {
      data: serializedData,
      metadata: {
        version,
        format,
        compressed: options.compress || false,
        encrypted: options.encrypt || false,
        timestamp,
        checksum,
      },
    };
  }

  /**
   * Deserialize data from distributed transmission
   */
  static deserialize<T>(serializedData: SerializedData): T {
    let data = serializedData.data;

    // Decrypt if encrypted
    if (serializedData.metadata.encrypted) {
      data = this.decrypt(data as Buffer);
    }

    // Decompress if compressed
    if (serializedData.metadata.compressed) {
      data = this.decompress(data as Buffer);
    }

    // Verify checksum
    if (serializedData.metadata.checksum) {
      const computedChecksum = this.generateChecksum(data);
      if (computedChecksum !== serializedData.metadata.checksum) {
        throw new Error('Checksum verification failed');
      }
    }

    // Deserialize based on format
    switch (serializedData.metadata.format) {
      case 'json':
        return JSON.parse(data.toString()) as T;
      case 'msgpack':
        // Note: In a real implementation, you would use a msgpack library
        return JSON.parse(data.toString()) as T;
      case 'protobuf':
        // Note: In a real implementation, you would use protobuf
        return JSON.parse(data.toString()) as T;
      default:
        return JSON.parse(data.toString()) as T;
    }
  }

  /**
   * Generate checksum for data integrity
   */
  private static generateChecksum(data: string | Buffer): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Compress data using gzip
   */
  private static compress(data: string | Buffer): Buffer {
    return gzipSync(data);
  }

  /**
   * Decompress data using gunzip
   */
  private static decompress(data: Buffer): Buffer {
    return gunzipSync(data);
  }

  /**
   * Encrypt data (placeholder - implement with your encryption method)
   */
  private static encrypt(data: string | Buffer): Buffer {
    // Placeholder - implement with your encryption method
    return Buffer.from(data);
  }

  /**
   * Decrypt data (placeholder - implement with your decryption method)
   */
  private static decrypt(data: Buffer): Buffer {
    // Placeholder - implement with your decryption method
    return data;
  }

  /**
   * Serialize for caching with TTL
   */
  static serializeForCache<T>(data: T, ttl: number = 3600): string {
    const serialized = this.serialize(data, {
      compress: true,
      format: 'json',
    });

    return JSON.stringify({
      ...serialized,
      ttl,
      expiresAt: Date.now() + (ttl * 1000),
    });
  }

  /**
   * Deserialize from cache
   */
  static deserializeFromCache<T>(serializedData: string): T | null {
    try {
      const parsed = JSON.parse(serializedData);
      
      // Check if expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        return null;
      }

      return this.deserialize(parsed);
    } catch (error) {
      return null;
    }
  }

  /**
   * Serialize for message queue
   */
  static serializeForQueue<T>(data: T, options: {
    priority?: number;
    retryCount?: number;
    correlationId?: string;
  } = {}): string {
    const serialized = this.serialize(data, {
      compress: true,
      format: 'json',
    });

    return JSON.stringify({
      ...serialized,
      priority: options.priority || 0,
      retryCount: options.retryCount || 0,
      correlationId: options.correlationId,
      timestamp: Date.now(),
    });
  }

  /**
   * Deserialize from message queue
   */
  static deserializeFromQueue<T>(serializedData: string): {
    data: T;
    metadata: any;
  } {
    const parsed = JSON.parse(serializedData);
    const data = this.deserialize<T>(parsed);

    return {
      data,
      metadata: {
        priority: parsed.priority,
        retryCount: parsed.retryCount,
        correlationId: parsed.correlationId,
        timestamp: parsed.timestamp,
      },
    };
  }

  /**
   * Serialize for API response
   */
  static serializeForApi<T>(data: T, options: {
    includeMetadata?: boolean;
    format?: 'json' | 'xml';
  } = {}): string {
    if (options.format === 'xml') {
      return this.toXML(data);
    }

    const response: any = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    if (options.includeMetadata) {
      response.metadata = {
        version: this.DEFAULT_VERSION,
        format: 'json',
      };
    }

    return JSON.stringify(response);
  }

  /**
   * Convert data to XML (basic implementation)
   */
  private static toXML(data: any): string {
    // Basic XML conversion - in a real implementation, use a proper XML library
    const convertToXML = (obj: any, rootName: string = 'root'): string => {
      if (typeof obj !== 'object' || obj === null) {
        return `<${rootName}>${obj}</${rootName}>`;
      }

      if (Array.isArray(obj)) {
        return obj.map(item => convertToXML(item, rootName)).join('');
      }

      const xmlParts = Object.entries(obj).map(([key, value]) => {
        return convertToXML(value, key);
      });

      return `<${rootName}>${xmlParts.join('')}</${rootName}>`;
    };

    return `<?xml version="1.0" encoding="UTF-8"?>${convertToXML(data)}`;
  }

  /**
   * Serialize for database storage
   */
  static serializeForDatabase<T>(data: T): string {
    return this.serialize(data, {
      compress: true,
      format: 'json',
    }).data.toString('base64');
  }

  /**
   * Deserialize from database storage
   */
  static deserializeFromDatabase<T>(serializedData: string): T {
    const buffer = Buffer.from(serializedData, 'base64');
    return this.deserialize({
      data: buffer,
      metadata: {
        version: this.DEFAULT_VERSION,
        format: 'json',
        compressed: true,
        encrypted: false,
        timestamp: Date.now(),
      },
    });
  }
}
