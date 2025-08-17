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
export declare class SerializationUtils {
    private static readonly DEFAULT_VERSION;
    private static readonly DEFAULT_FORMAT;
    static serialize<T>(data: T, options?: SerializationOptions): SerializedData;
    static deserialize<T>(serializedData: SerializedData): T;
    private static generateChecksum;
    private static compress;
    private static decompress;
    private static encrypt;
    private static decrypt;
    static serializeForCache<T>(data: T, ttl?: number): string;
    static deserializeFromCache<T>(serializedData: string): T | null;
    static serializeForQueue<T>(data: T, options?: {
        priority?: number;
        retryCount?: number;
        correlationId?: string;
    }): string;
    static deserializeFromQueue<T>(serializedData: string): {
        data: T;
        metadata: any;
    };
    static serializeForApi<T>(data: T, options?: {
        includeMetadata?: boolean;
        format?: 'json' | 'xml';
    }): string;
    private static toXML;
    static serializeForDatabase<T>(data: T): string;
    static deserializeFromDatabase<T>(serializedData: string): T;
}
//# sourceMappingURL=serialization.d.ts.map