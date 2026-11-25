'use strict';

module.exports = (sequelize, DataTypes) => {
  const Secret = sequelize.define(
    'Secret',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING(100), allowNull: false },
      // Contenido cifrado con AES-256-GCM (base64). El texto plano nunca se persiste.
      ciphertext: { type: DataTypes.TEXT, allowNull: false },
      iv: { type: DataTypes.STRING(24), allowNull: false },
      authTag: { type: DataTypes.STRING(24), allowNull: false },
    },
    {
      tableName: 'secrets',
      underscored: true,
    }
  );

  Secret.associate = (models) => {
    Secret.belongsTo(models.User, { foreignKey: 'userId', as: 'owner', onDelete: 'CASCADE' });
  };

  return Secret;
};
