import { Sequelize } from 'sequelize';
declare const sequelize: Sequelize;
export declare const testConnection: () => Promise<void>;
export declare const syncDatabase: () => Promise<void>;
export declare const closeConnection: () => Promise<void>;
export default sequelize;
//# sourceMappingURL=index.d.ts.map