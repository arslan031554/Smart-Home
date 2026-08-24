'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of ['Projects', 'ProjectRooms']) {
      const description = await queryInterface.describeTable(table);
      if (!description.translations) {
        await queryInterface.addColumn(table, 'translations', {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {}
        });
      }
    }
  },

  async down(queryInterface) {
    for (const table of ['ProjectRooms', 'Projects']) {
      const description = await queryInterface.describeTable(table);
      if (description.translations) {
        await queryInterface.removeColumn(table, 'translations');
      }
    }
  }
};
