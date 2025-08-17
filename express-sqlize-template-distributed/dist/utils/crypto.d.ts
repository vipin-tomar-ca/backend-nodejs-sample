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
export declare class CryptoUtils {
    private static readonly DEFAULT_ALGORITHM;
    private static readonly DEFAULT_HASH_ALGORITHM;
    private static readonly DEFAULT_ITERATIONS;
    static generateRandomString(length?: number): string;
    static generateRandomBuffer(length?: number): Buffer;
    static hashString(input: string, options?: Partial<HashOptions>): string;
    static verifyHash(input: string, hashedValue: string, options?: Partial<HashOptions>): boolean;
    static encrypt(data: string, options: EncryptionOptions): string;
    static decrypt(encryptedData: string, options: EncryptionOptions): string;
    static createHmacSignature(data: string, secret: string, algorithm?: string): string;
    static verifyHmacSignature(data: string, signature: string, secret: string, algorithm?: string): boolean;
    static generateSecureToken(payload: any, secret: string, expiresIn?: number): string;
    static verifySecureToken(token: string, secret: string): any;
    static generateConsistentHash(input: string, ringSize?: number): number;
    static generateSessionId(): string;
    static generateApiKey(prefix?: string): string;
}
//# sourceMappingURL=crypto.d.ts.map