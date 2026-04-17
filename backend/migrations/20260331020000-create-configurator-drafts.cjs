'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const hasTable = tables.map((table) => (typeof table === 'string' ? table : table.tableName || table.table_name)).includes('ConfiguratorDrafts');
    if (hasTable) {
      return;
    }

    await queryInterface.createTable('ConfiguratorDrafts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      snapshot: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      configurationStatus: {
        type: Sequelize.ENUM('active', 'completed', 'converted'),
        allowNull: false,
        defaultValue: 'active',
      },
      convertedOfferId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      channelEmail: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      channelSms: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lastActivityAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      lastReminderAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      nextReminderAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      pattern: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'unfinished_configuration',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
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

    await queryInterface.addIndex('ConfiguratorDrafts', ['userId']);
    await queryInterface.addIndex('ConfiguratorDrafts', ['userId', 'configurationStatus']);
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const hasTable = tables.map((table) => (typeof table === 'string' ? table : table.tableName || table.table_name)).includes('ConfiguratorDrafts');
    if (hasTable) {
      await queryInterface.dropTable('ConfiguratorDrafts');
    }
  },
};
