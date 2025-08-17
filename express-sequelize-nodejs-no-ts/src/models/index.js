const User = require('./User');

const initializeModels = (sequelize) => {
  const models = {
    User: User(sequelize),
  };

  // Define associations here
  // Example: models.User.hasMany(models.Post);
  // Example: models.Post.belongsTo(models.User);

  console.log('All models initialized');

  return models;
};

module.exports = {
  initializeModels,
  User,
};
