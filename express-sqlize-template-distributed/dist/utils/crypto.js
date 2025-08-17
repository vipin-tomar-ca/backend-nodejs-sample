"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoUtils = void 0;
const crypto_1 = require("crypto");
class CryptoUtils {
    static generateRandomString(length = 32) {
        return (0, crypto_1.randomBytes)(length).toString('hex');
    }
    static generateRandomBuffer(length = 32) {
        return (0, crypto_1.randomBytes)(length);
    }
    static hashString(input, options = {}) {
        const algorithm = options.algorithm || this.DEFAULT_HASH_ALGORITHM;
        const salt = options.salt || this.generateRandomString(16);
        const iterations = options.iterations || this.DEFAULT_ITERATIONS;
        let hash = input + salt;
        for (let i = 0; i < iterations; i++) {
            hash = (0, crypto_1.createHash)(algorithm).update(hash).digest('hex');
        }
        return `${salt}:${iterations}:${hash}`;
    }
    static verifyHash(input, hashedValue, options = {}) {
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
    static encrypt(data, options) {
        const algorithm = options.algorithm || this.DEFAULT_ALGORITHM;
        const key = Buffer.from(options.key, 'hex');
        const iv = options.iv || this.generateRandomBuffer(16);
        const cipher = (0, crypto_1.createCipher)(algorithm, key);
        cipher.setAutoPadding(true);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }
    static decrypt(encryptedData, options) {
        const algorithm = options.algorithm || this.DEFAULT_ALGORITHM;
        const key = Buffer.from(options.key, 'hex');
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format');
        }
        const [ivHex, encrypted] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = (0, crypto_1.createDecipher)(algorithm, key);
        decipher.setAutoPadding(true);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    static createHmacSignature(data, secret, algorithm = 'sha256') {
        return (0, crypto_1.createHmac)(algorithm, secret).update(data).digest('hex');
    }
    static verifyHmacSignature(data, signature, secret, algorithm = 'sha256') {
        const expectedSignature = this.createHmacSignature(data, secret, algorithm);
        return signature === expectedSignature;
    }
    static generateSecureToken(payload, secret, expiresIn = 3600) {
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
        const signature = this.createHmacSignature(`${encodedHeader}.${encodedBody}`, secret);
        return `${encodedHeader}.${encodedBody}.${signature}`;
    }
    static verifySecureToken(token, secret) {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }
        const [encodedHeader, encodedBody, signature] = parts;
        const expectedSignature = this.createHmacSignature(`${encodedHeader}.${encodedBody}`, secret);
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
    static generateConsistentHash(input, ringSize = 360) {
        const hash = (0, crypto_1.createHash)('md5').update(input).digest('hex');
        const hashValue = parseInt(hash.substring(0, 8), 16);
        return hashValue % ringSize;
    }
    static generateSessionId() {
        return this.generateRandomString(32);
    }
    static generateApiKey(prefix = 'api') {
        const timestamp = Date.now().toString(36);
        const random = this.generateRandomString(16);
        return `${prefix}_${timestamp}_${random}`;
    }
}
exports.CryptoUtils = CryptoUtils;
CryptoUtils.DEFAULT_ALGORITHM = 'aes-256-cbc';
CryptoUtils.DEFAULT_HASH_ALGORITHM = 'sha256';
CryptoUtils.DEFAULT_ITERATIONS = 10000;
//# sourceMappingURL=crypto.js.map