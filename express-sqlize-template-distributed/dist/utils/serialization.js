"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializationUtils = void 0;
class SerializationUtils {
    static serialize(data, options = {}) {
        const format = options.format || this.DEFAULT_FORMAT;
        const version = options.version || this.DEFAULT_VERSION;
        const timestamp = Date.now();
        let serializedData;
        let checksum;
        switch (format) {
            case 'json':
                serializedData = JSON.stringify(data);
                break;
            case 'msgpack':
                serializedData = JSON.stringify(data);
                break;
            case 'protobuf':
                serializedData = JSON.stringify(data);
                break;
            default:
                serializedData = JSON.stringify(data);
        }
        checksum = this.generateChecksum(serializedData);
        if (options.compress) {
            serializedData = this.compress(serializedData);
        }
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
    static deserialize(serializedData) {
        let data = serializedData.data;
        if (serializedData.metadata.encrypted) {
            data = this.decrypt(data);
        }
        if (serializedData.metadata.compressed) {
            data = this.decompress(data);
        }
        if (serializedData.metadata.checksum) {
            const computedChecksum = this.generateChecksum(data);
            if (computedChecksum !== serializedData.metadata.checksum) {
                throw new Error('Checksum verification failed');
            }
        }
        switch (serializedData.metadata.format) {
            case 'json':
                return JSON.parse(data.toString());
            case 'msgpack':
                return JSON.parse(data.toString());
            case 'protobuf':
                return JSON.parse(data.toString());
            default:
                return JSON.parse(data.toString());
        }
    }
    static generateChecksum(data) {
        return createHash('sha256').update(data).digest('hex');
    }
    static compress(data) {
        return gzipSync(data);
    }
    static decompress(data) {
        return gunzipSync(data);
    }
    static encrypt(data) {
        return Buffer.from(data);
    }
    static decrypt(data) {
        return data;
    }
    static serializeForCache(data, ttl = 3600) {
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
    static deserializeFromCache(serializedData) {
        try {
            const parsed = JSON.parse(serializedData);
            if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
                return null;
            }
            return this.deserialize(parsed);
        }
        catch (error) {
            return null;
        }
    }
    static serializeForQueue(data, options = {}) {
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
    static deserializeFromQueue(serializedData) {
        const parsed = JSON.parse(serializedData);
        const data = this.deserialize(parsed);
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
    static serializeForApi(data, options = {}) {
        if (options.format === 'xml') {
            return this.toXML(data);
        }
        const response = {
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
    static toXML(data) {
        const convertToXML = (obj, rootName = 'root') => {
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
    static serializeForDatabase(data) {
        return this.serialize(data, {
            compress: true,
            format: 'json',
        }).data.toString('base64');
    }
    static deserializeFromDatabase(serializedData) {
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
exports.SerializationUtils = SerializationUtils;
SerializationUtils.DEFAULT_VERSION = '1.0.0';
SerializationUtils.DEFAULT_FORMAT = 'json';
//# sourceMappingURL=serialization.js.map