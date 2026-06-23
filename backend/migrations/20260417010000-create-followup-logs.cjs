'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const hasTable = tables
      .map((table) => (typeof table === 'string' ? table : table.tableName || table.table_name))
      .includes('FollowupLogs');
    if (hasTable) {
      return;
    }

    await queryInterface.createTable('FollowupLogs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      context: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      offerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Offers',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      configuratorDraftId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'ConfiguratorDrafts',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Projects',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      channel: {
        type: Sequelize.ENUM('email', 'sms'),
        allowNull: false,
      },
      reminderStep: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      cadenceDay: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      templateId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'FollowupTemplates',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'sent',
      },
      target: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      providerMessageId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      deliveryMeta: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('FollowupLogs', ['offerId']);
    await queryInterface.addIndex('FollowupLogs', ['configuratorDraftId']);
    await queryInterface.addIndex('FollowupLogs', ['projectId']);
    await queryInterface.addIndex('FollowupLogs', ['userId']);
    await queryInterface.addIndex('FollowupLogs', ['cadenceDay']);
    await queryInterface.addIndex('FollowupLogs', ['context', 'channel']);
    await queryInterface.addIndex('FollowupLogs', ['status']);
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const hasTable = tables
      .map((table) => (typeof table === 'string' ? table : table.tableName || table.table_name))
      .includes('FollowupLogs');
    if (hasTable) {
      await queryInterface.dropTable('FollowupLogs');
    }

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_FollowupLogs_channel";').catch(() => {});
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_followuplogs_channel";').catch(() => {});
  },
};

