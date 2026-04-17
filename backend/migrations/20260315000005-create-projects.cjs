'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Projects', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      buildingTypeId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'BuildingTypes',
          key: 'id'
        }
      },
      builtUpArea: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      levelsCount: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      multiplicationIndex: {
        type: Sequelize.FLOAT,
        defaultValue: 1.0
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      selectedRangeId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      selectedColorId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'archived'),
        defaultValue: 'draft'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Projects');
  }
};
