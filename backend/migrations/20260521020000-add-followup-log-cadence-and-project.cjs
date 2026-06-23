'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('FollowupLogs');

    if (!table.projectId) {
      await queryInterface.addColumn('FollowupLogs', 'projectId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Projects',
          key: 'id',
        },
        onDelete: 'SET NULL',
      });
    }

    if (!table.cadenceDay) {
      await queryInterface.addColumn('FollowupLogs', 'cadenceDay', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    await queryInterface.addIndex('FollowupLogs', ['projectId'], {
      name: 'followup_logs_project_id_idx',
    }).catch(() => {});
    await queryInterface.addIndex('FollowupLogs', ['cadenceDay'], {
      name: 'followup_logs_cadence_day_idx',
    }).catch(() => {});

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS followup_logs_offer_cadence_channel_unique
      ON "FollowupLogs" ("userId", "projectId", "offerId", "cadenceDay", "channel")
      WHERE "offerId" IS NOT NULL AND "cadenceDay" IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS followup_logs_draft_cadence_channel_unique
      ON "FollowupLogs" ("userId", "configuratorDraftId", "cadenceDay", "channel")
      WHERE "configuratorDraftId" IS NOT NULL AND "cadenceDay" IS NOT NULL;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS followup_logs_offer_cadence_channel_unique;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS followup_logs_draft_cadence_channel_unique;');
    await queryInterface.removeIndex('FollowupLogs', 'followup_logs_project_id_idx').catch(() => {});
    await queryInterface.removeIndex('FollowupLogs', 'followup_logs_cadence_day_idx').catch(() => {});

    const table = await queryInterface.describeTable('FollowupLogs');
    if (table.cadenceDay) {
      await queryInterface.removeColumn('FollowupLogs', 'cadenceDay');
    }
    if (table.projectId) {
      await queryInterface.removeColumn('FollowupLogs', 'projectId');
    }
  },
};
