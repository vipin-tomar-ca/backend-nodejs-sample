export interface MetricValue {
    value: number;
    timestamp: number;
    labels?: Record<string, string>;
}
export interface Metric {
    name: string;
    type: 'counter' | 'gauge' | 'histogram' | 'summary';
    description?: string;
    unit?: string;
    values: MetricValue[];
}
export interface MetricsCollector {
    increment(name: string, value?: number, labels?: Record<string, string>): void;
    gauge(name: string, value: number, labels?: Record<string, string>): void;
    histogram(name: string, value: number, labels?: Record<string, string>): void;
    summary(name: string, value: number, labels?: Record<string, string>): void;
    record(name: string, value: number, type: Metric['type'], labels?: Record<string, string>): void;
    getMetrics(): Metric[];
    reset(): void;
}
export declare class MetricsUtils implements MetricsCollector {
    private metrics;
    private static instance;
    private constructor();
    static getInstance(): MetricsUtils;
    increment(name: string, value?: number, labels?: Record<string, string>): void;
    gauge(name: string, value: number, labels?: Record<string, string>): void;
    histogram(name: string, value: number, labels?: Record<string, string>): void;
    summary(name: string, value: number, labels?: Record<string, string>): void;
    record(name: string, value: number, type: Metric['type'], labels?: Record<string, string>): void;
    getMetrics(): Metric[];
    reset(): void;
    getMetric(name: string, labels?: Record<string, string>): Metric | undefined;
    getMetricStats(name: string, labels?: Record<string, string>): {
        count: number;
        sum: number;
        min: number;
        max: number;
        avg: number;
        latest: number;
    } | null;
    exportPrometheus(): string;
    exportJSON(): string;
    private getMetricKey;
    static createHttpMetricsMiddleware(): (req: any, res: any, next: any) => void;
    static createDatabaseMetricsMiddleware(): (sequelize: any) => void;
    static recordMemoryMetrics(): void;
    static recordCpuMetrics(): void;
    static startPeriodicCollection(intervalMs?: number): NodeJS.Timeout;
}
//# sourceMappingURL=metrics.d.ts.map