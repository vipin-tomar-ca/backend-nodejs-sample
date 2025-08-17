import { LogLevel } from '../types';
import * as winston from 'winston';
export declare class LoggerService {
    private logger;
    constructor();
    private initializeLogger;
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    log(level: LogLevel, message: string, meta?: any): void;
    logRequest(req: any, res: any, responseTime?: number): void;
    logDatabaseQuery(sql: string, duration: number, params?: any): void;
    logBusinessOperation(operation: string, data: any, userId?: number): void;
    logSecurityEvent(event: string, details: any, userId?: number): void;
    logPerformanceMetric(metric: string, value: number, unit?: string): void;
    child(meta: any): LoggerService;
    getLogger(): winston.Logger;
}
//# sourceMappingURL=LoggerService.d.ts.map