'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('secrets', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING(100), allowNull: false },
      ciphertext: { type: Sequelize.TEXT, allowNull: false },
      iv: { type: Sequelize.STRING(24), allowNull: false },
      auth_tag: { type: Sequelize.STRING(24), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    }, { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    await queryInterface.addIndex('secrets', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('secrets');
  },
};
