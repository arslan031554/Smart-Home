'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('ProductRanges');

    if (!table.priceMultiplier) {
      await queryInterface.addColumn('ProductRanges', 'priceMultiplier', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 1.0,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('ProductRanges');

    if (table.priceMultiplier) {
      await queryInterface.removeColumn('ProductRanges', 'priceMultiplier');
    }
  },
};
