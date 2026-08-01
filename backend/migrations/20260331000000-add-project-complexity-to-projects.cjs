'use strict';

async function describeTableOrNull(queryInterface, tableName) {
    try {
        return await queryInterface.describeTable(tableName);
    } catch (_) {
        return null;
    }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await describeTableOrNull(queryInterface, 'Projects');
    if (!table || table.projectComplexity) return;

    await queryInterface.addColumn('Projects', 'projectComplexity', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const table = await describeTableOrNull(queryInterface, 'Projects');
    if (table?.projectComplexity) {
      await queryInterface.removeColumn('Projects', 'projectComplexity');
    }
  }
};