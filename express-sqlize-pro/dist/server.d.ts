import 'reflect-metadata';
import express from 'express';
import './models';
export declare class App {
    app: express.Application;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    start(): Promise<void>;
}
declare const app: App;
export default app;
//# sourceMappingURL=server.d.ts.map