'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SmartFunctionRoomTypes', {
      smartFunctionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'SmartFunctions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      roomTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'RoomTypes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SmartFunctionRoomTypes');
  }
};
