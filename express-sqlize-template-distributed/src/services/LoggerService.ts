import { injectable } from '../container/ioc';
import { LogLevel, ILogEntry } from '../types';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.initializeLogger();
  }

  /**
   * Initialize Winston logger
   */
  private initializeLogger(): void {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'express-template' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: consoleFormat,
        }),

        // File transport for errors
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
        }),

        // File transport for all logs
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new DailyRotateFile({
        filename: 'logs/exceptions-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
      })
    );

    // Handle unhandled promise rejections
    this.logger.rejections.handle(
      new DailyRotateFile({
        filename: 'logs/rejections-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
      })
    );
  }

  /**
   * Log an error message
   */
  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log an info message
   */
  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log a debug message
   */
  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log with custom level
   */
  public log(level: LogLevel, message: string, meta?: any): void {
    this.logger.log(level, message, meta);
  }

  /**
   * Log HTTP request
   */
  public logRequest(req: any, res: any, responseTime?: number): void {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      correlationId: req.correlationId,
      userId: req.user?.id,
    };

    if (res.statusCode >= 400) {
      this.warn('HTTP Request', logData);
    } else {
      this.info('HTTP Request', logData);
    }
  }

  /**
   * Log database query
   */
  public logDatabaseQuery(sql: string, duration: number, params?: any): void {
    this.debug('Database Query', {
      sql,
      duration: `${duration}ms`,
      params,
    });
  }

  /**
   * Log business operation
   */
  public logBusinessOperation(operation: string, data: any, userId?: number): void {
    this.info('Business Operation', {
      operation,
      data,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log security event
   */
  public logSecurityEvent(event: string, details: any, userId?: number): void {
    this.warn('Security Event', {
      event,
      details,
      userId,
      timestamp: new Date().toISOString(),
      ip: details.ip,
    });
  }

  /**
   * Log performance metric
   */
  public logPerformanceMetric(metric: string, value: number, unit: string = 'ms'): void {
    this.info('Performance Metric', {
      metric,
      value: `${value}${unit}`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Create a child logger with additional context
   */
  public child(meta: any): LoggerService {
    const childLogger = new LoggerService();
    childLogger.logger = this.logger.child(meta);
    return childLogger;
  }

  /**
   * Get logger instance (for advanced usage)
   */
  public getLogger(): winston.Logger {
    return this.logger;
  }
}
