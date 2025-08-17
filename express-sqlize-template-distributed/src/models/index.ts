// Models Index - Initialize all Sequelize models

import { Sequelize } from 'sequelize';
import { User, initUserModel } from './User';

// Initialize all models
export const initializeModels = (sequelize: Sequelize): void => {
  // Initialize each model
  initUserModel(sequelize);

  // Define associations here
  // Example: User.hasMany(Post);
  // Example: Post.belongsTo(User);

  console.log('All models initialized');
};

// Export all models
export { User };
export type { IUser } from './User';

// Export default models object
export default {
  User,
};
