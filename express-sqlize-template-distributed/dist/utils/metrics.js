"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsUtils = void 0;
class MetricsUtils {
    constructor() {
        this.metrics = new Map();
    }
    static getInstance() {
        if (!MetricsUtils.instance) {
            MetricsUtils.instance = new MetricsUtils();
        }
        return MetricsUtils.instance;
    }
    increment(name, value = 1, labels) {
        this.record(name, value, 'counter', labels);
    }
    gauge(name, value, labels) {
        this.record(name, value, 'gauge', labels);
    }
    histogram(name, value, labels) {
        this.record(name, value, 'histogram', labels);
    }
    summary(name, value, labels) {
        this.record(name, value, 'summary', labels);
    }
    record(name, value, type, labels) {
        const metricKey = this.getMetricKey(name, labels);
        if (!this.metrics.has(metricKey)) {
            this.metrics.set(metricKey, {
                name,
                type,
                values: [],
            });
        }
        const metric = this.metrics.get(metricKey);
        metric.values.push({
            value,
            timestamp: Date.now(),
            labels,
        });
        if (metric.values.length > 1000) {
            metric.values = metric.values.slice(-1000);
        }
    }
    getMetrics() {
        return Array.from(this.metrics.values());
    }
    reset() {
        this.metrics.clear();
    }
    getMetric(name, labels) {
        const metricKey = this.getMetricKey(name, labels);
        return this.metrics.get(metricKey);
    }
    getMetricStats(name, labels) {
        const metric = this.getMetric(name, labels);
        if (!metric || metric.values.length === 0) {
            return null;
        }
        const values = metric.values.map(v => v.value);
        const sum = values.reduce((a, b) => a + b, 0);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = sum / values.length;
        const latest = values[values.length - 1];
        return {
            count: values.length,
            sum,
            min,
            max,
            avg,
            latest,
        };
    }
    exportPrometheus() {
        const lines = [];
        for (const metric of this.metrics.values()) {
            lines.push(`# TYPE ${metric.name} ${metric.type}`);
            if (metric.description) {
                lines.push(`# HELP ${metric.name} ${metric.description}`);
            }
            for (const value of metric.values.slice(-10)) {
                const labels = value.labels ?
                    `{${Object.entries(value.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}` :
                    '';
                lines.push(`${metric.name}${labels} ${value.value} ${value.timestamp}`);
            }
        }
        return lines.join('\n');
    }
    exportJSON() {
        return JSON.stringify({
            timestamp: Date.now(),
            metrics: this.getMetrics(),
        }, null, 2);
    }
    getMetricKey(name, labels) {
        if (!labels) {
            return name;
        }
        const labelString = Object.entries(labels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join(',');
        return `${name}{${labelString}}`;
    }
    static createHttpMetricsMiddleware() {
        const metrics = MetricsUtils.getInstance();
        return (req, res, next) => {
            const startTime = Date.now();
            const method = req.method;
            const path = req.route?.path || req.path;
            metrics.increment('http_requests_total', 1, { method, path });
            const originalEnd = res.end;
            res.end = function (chunk, encoding) {
                const duration = Date.now() - startTime;
                const statusCode = res.statusCode;
                metrics.histogram('http_request_duration_ms', duration, { method, path });
                metrics.increment('http_responses_total', 1, { method, path, status: statusCode.toString() });
                originalEnd.call(this, chunk, encoding);
            };
            next();
        };
    }
    static createDatabaseMetricsMiddleware() {
        const metrics = MetricsUtils.getInstance();
        return (sequelize) => {
            sequelize.addHook('beforeQuery', (options) => {
                const startTime = Date.now();
                options._metricsStartTime = startTime;
            });
            sequelize.addHook('afterQuery', (options, query) => {
                const duration = Date.now() - (options._metricsStartTime || Date.now());
                const table = query.sql.match(/FROM\s+`?(\w+)`?/i)?.[1] || 'unknown';
                metrics.histogram('database_query_duration_ms', duration, { table });
                metrics.increment('database_queries_total', 1, { table });
            });
        };
    }
    static recordMemoryMetrics() {
        const metrics = MetricsUtils.getInstance();
        const usage = process.memoryUsage();
        metrics.gauge('process_memory_heap_used_bytes', usage.heapUsed);
        metrics.gauge('process_memory_heap_total_bytes', usage.heapTotal);
        metrics.gauge('process_memory_external_bytes', usage.external);
        metrics.gauge('process_memory_rss_bytes', usage.rss);
    }
    static recordCpuMetrics() {
        const metrics = MetricsUtils.getInstance();
        const usage = process.cpuUsage();
        metrics.gauge('process_cpu_user_seconds_total', usage.user / 1000000);
        metrics.gauge('process_cpu_system_seconds_total', usage.system / 1000000);
    }
    static startPeriodicCollection(intervalMs = 60000) {
        return setInterval(() => {
            this.recordMemoryMetrics();
            this.recordCpuMetrics();
        }, intervalMs);
    }
}
exports.MetricsUtils = MetricsUtils;
//# sourceMappingURL=metrics.js.map