'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BuildingTypeRoomTypes', {
      buildingTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'BuildingTypes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      roomTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'RoomTypes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
    await queryInterface.addIndex('BuildingTypeRoomTypes', ['buildingTypeId', 'roomTypeId'], { unique: true });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BuildingTypeRoomTypes');
  }
};
