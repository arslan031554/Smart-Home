'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('SmartFunctions', 'inputChannelCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('SmartFunctions', 'outputChannelCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('SmartFunctions', 'generalChannelCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('SmartFunctions', 'generalChannelCount');
    await queryInterface.removeColumn('SmartFunctions', 'outputChannelCount');
    await queryInterface.removeColumn('SmartFunctions', 'inputChannelCount');
  }
};
