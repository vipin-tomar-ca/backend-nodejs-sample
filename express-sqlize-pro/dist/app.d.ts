import express from 'express';
import 'reflect-metadata';
export declare class App {
    app: express.Application;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    start(): Promise<void>;
    getApp(): express.Application;
}
//# sourceMappingURL=app.d.ts.map