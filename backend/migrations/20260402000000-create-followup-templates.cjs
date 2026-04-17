'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const hasTable = tables.map((table) => (typeof table === 'string' ? table : table.tableName || table.table_name)).includes('FollowupTemplates');
    if (hasTable) {
      return;
    }

    await queryInterface.createTable('FollowupTemplates', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      channel: {
        type: Sequelize.ENUM('email', 'sms'),
        allowNull: false,
      },
      step: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      language: {
        type: Sequelize.ENUM('en', 'ro'),
        allowNull: false,
        defaultValue: 'en',
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('FollowupTemplates', ['channel', 'step', 'language']);
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const hasTable = tables.map((table) => (typeof table === 'string' ? table : table.tableName || table.table_name)).includes('FollowupTemplates');
    if (hasTable) {
      await queryInterface.dropTable('FollowupTemplates');
    }
  },
};
