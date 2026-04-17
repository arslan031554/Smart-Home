'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ServiceSmartFunctions', {
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Services', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      smartFunctionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'SmartFunctions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ServiceSmartFunctions');
  }
};
