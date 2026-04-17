'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      'BuildingTypes',
      'RoomTypes',
      'SmartFunctions',
      'ProductRanges',
      'Colors',
      'Products',
      'Services',
      'OfferConditions',
      'Disclaimers'
    ];

    for (const table of tables) {
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
    const tables = [
      'Disclaimers',
      'OfferConditions',
      'Services',
      'Products',
      'Colors',
      'ProductRanges',
      'SmartFunctions',
      'RoomTypes',
      'BuildingTypes'
    ];

    for (const table of tables) {
      const description = await queryInterface.describeTable(table);
      if (description.translations) {
        await queryInterface.removeColumn(table, 'translations');
      }
    }
  }
};
