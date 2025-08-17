declare class Server {
    private app;
    private port;
    private logger;
    constructor();
    initialize(): Promise<void>;
    private setupMiddleware;
    private setupRoutes;
    private initializeDistributedServices;
    private setupHealthChecks;
    private setupMetricsCollection;
    private setupErrorHandling;
    start(): Promise<void>;
    shutdown(): Promise<void>;
}
declare const server: Server;
export default server;
//# sourceMappingURL=server.d.ts.map