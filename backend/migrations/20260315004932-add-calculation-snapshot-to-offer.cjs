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
    const table = await describeTableOrNull(queryInterface, 'Offers');
    if (!table || table.calculationSnapshot) return;

    await queryInterface.addColumn('Offers', 'calculationSnapshot', {
      type: Sequelize.JSONB,
      allowNull: true
    });
  },

  async down(queryInterface) {
    const table = await describeTableOrNull(queryInterface, 'Offers');
    if (table?.calculationSnapshot) {
      await queryInterface.removeColumn('Offers', 'calculationSnapshot');
    }
  }
};