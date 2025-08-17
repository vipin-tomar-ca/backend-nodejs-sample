// Metrics collection utilities for distributed systems

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

/**
 * Metrics collection utilities for distributed systems
 */
export class MetricsUtils implements MetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  private static instance: MetricsUtils;

  private constructor() {}

  static getInstance(): MetricsUtils {
    if (!MetricsUtils.instance) {
      MetricsUtils.instance = new MetricsUtils();
    }
    return MetricsUtils.instance;
  }

  /**
   * Increment a counter metric
   */
  increment(name: string, value: number = 1, labels?: Record<string, string>): void {
    this.record(name, value, 'counter', labels);
  }

  /**
   * Set a gauge metric
   */
  gauge(name: string, value: number, labels?: Record<string, string>): void {
    this.record(name, value, 'gauge', labels);
  }

  /**
   * Record a histogram metric
   */
  histogram(name: string, value: number, labels?: Record<string, string>): void {
    this.record(name, value, 'histogram', labels);
  }

  /**
   * Record a summary metric
   */
  summary(name: string, value: number, labels?: Record<string, string>): void {
    this.record(name, value, 'summary', labels);
  }

  /**
   * Record a metric value
   */
  record(name: string, value: number, type: Metric['type'], labels?: Record<string, string>): void {
    const metricKey = this.getMetricKey(name, labels);
    
    if (!this.metrics.has(metricKey)) {
      this.metrics.set(metricKey, {
        name,
        type,
        values: [],
      });
    }

    const metric = this.metrics.get(metricKey)!;
    metric.values.push({
      value,
      timestamp: Date.now(),
      labels,
    });

    // Keep only last 1000 values to prevent memory leaks
    if (metric.values.length > 1000) {
      metric.values = metric.values.slice(-1000);
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
  }

  /**
   * Get metric by name
   */
  getMetric(name: string, labels?: Record<string, string>): Metric | undefined {
    const metricKey = this.getMetricKey(name, labels);
    return this.metrics.get(metricKey);
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name: string, labels?: Record<string, string>): {
    count: number;
    sum: number;
    min: number;
    max: number;
    avg: number;
    latest: number;
  } | null {
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

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = [];
    
    for (const metric of this.metrics.values()) {
      // Add metric type comment
      lines.push(`# TYPE ${metric.name} ${metric.type}`);
      
      if (metric.description) {
        lines.push(`# HELP ${metric.name} ${metric.description}`);
      }

      // Add metric values
      for (const value of metric.values.slice(-10)) { // Last 10 values
        const labels = value.labels ? 
          `{${Object.entries(value.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}` : 
          '';
        lines.push(`${metric.name}${labels} ${value.value} ${value.timestamp}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Export metrics in JSON format
   */
  exportJSON(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.getMetrics(),
    }, null, 2);
  }

  /**
   * Generate metric key
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) {
      return name;
    }
    
    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    
    return `${name}{${labelString}}`;
  }

  /**
   * Create HTTP request metrics middleware
   */
  static createHttpMetricsMiddleware() {
    const metrics = MetricsUtils.getInstance();
    
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const method = req.method;
      const path = req.route?.path || req.path;
      
      // Record request start
      metrics.increment('http_requests_total', 1, { method, path });
      
      // Override res.end to record response metrics
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        
        // Record response metrics
        metrics.histogram('http_request_duration_ms', duration, { method, path });
        metrics.increment('http_responses_total', 1, { method, path, status: statusCode.toString() });
        
        originalEnd.call(this, chunk, encoding);
      };
      
      next();
    };
  }

  /**
   * Create database metrics middleware
   */
  static createDatabaseMetricsMiddleware() {
    const metrics = MetricsUtils.getInstance();
    
    return (sequelize: any) => {
      // Hook into Sequelize queries
      sequelize.addHook('beforeQuery', (options: any) => {
        const startTime = Date.now();
        options._metricsStartTime = startTime;
      });

      sequelize.addHook('afterQuery', (options: any, query: any) => {
        const duration = Date.now() - (options._metricsStartTime || Date.now());
        const table = query.sql.match(/FROM\s+`?(\w+)`?/i)?.[1] || 'unknown';
        
        metrics.histogram('database_query_duration_ms', duration, { table });
        metrics.increment('database_queries_total', 1, { table });
      });
    };
  }

  /**
   * Create memory usage metrics
   */
  static recordMemoryMetrics(): void {
    const metrics = MetricsUtils.getInstance();
    const usage = process.memoryUsage();
    
    metrics.gauge('process_memory_heap_used_bytes', usage.heapUsed);
    metrics.gauge('process_memory_heap_total_bytes', usage.heapTotal);
    metrics.gauge('process_memory_external_bytes', usage.external);
    metrics.gauge('process_memory_rss_bytes', usage.rss);
  }

  /**
   * Create CPU usage metrics
   */
  static recordCpuMetrics(): void {
    const metrics = MetricsUtils.getInstance();
    const usage = process.cpuUsage();
    
    metrics.gauge('process_cpu_user_seconds_total', usage.user / 1000000);
    metrics.gauge('process_cpu_system_seconds_total', usage.system / 1000000);
  }

  /**
   * Start periodic metrics collection
   */
  static startPeriodicCollection(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(() => {
      this.recordMemoryMetrics();
      this.recordCpuMetrics();
    }, intervalMs);
  }
}
