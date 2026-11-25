'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
      // Hash Argon2id (incluye sal y parámetros). Nunca se expone en respuestas.
      passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    },
    {
      tableName: 'users',
      underscored: true,
      defaultScope: { attributes: { exclude: ['passwordHash'] } },
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Secret, { foreignKey: 'userId', as: 'secrets', onDelete: 'CASCADE' });
  };

  User.prototype.toJSON = function toJSON() {
    const { id, email, createdAt } = this.get();
    return { id, email, createdAt };
  };

  return User;
};
