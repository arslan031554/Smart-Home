'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (!table.employeeRole) {
      await queryInterface.addColumn('Users', 'employeeRole', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!table.permissions) {
      await queryInterface.addColumn('Users', 'permissions', {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      });
    }

    if (!table.isActive) {
      await queryInterface.addColumn('Users', 'isActive', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Users');

    if (table.isActive) {
      await queryInterface.removeColumn('Users', 'isActive');
    }
    if (table.permissions) {
      await queryInterface.removeColumn('Users', 'permissions');
    }
    if (table.employeeRole) {
      await queryInterface.removeColumn('Users', 'employeeRole');
    }
  }
};
