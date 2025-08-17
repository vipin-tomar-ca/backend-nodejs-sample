import { Sequelize } from 'sequelize';
export declare const initializeDatabase: () => Promise<Sequelize>;
export declare const closeDatabase: (sequelize: Sequelize) => Promise<void>;
export declare const syncDatabase: (sequelize: Sequelize, force?: boolean) => Promise<void>;
export declare const runMigrations: (sequelize: Sequelize) => Promise<void>;
//# sourceMappingURL=connection.d.ts.map