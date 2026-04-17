'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (!table.preferredLanguage) {
      await queryInterface.addColumn('Users', 'preferredLanguage', {
        type: Sequelize.ENUM('en', 'ro'),
        allowNull: false,
        defaultValue: 'en'
      });
    }

    if (!table.preferredVerificationChannel) {
      await queryInterface.addColumn('Users', 'preferredVerificationChannel', {
        type: Sequelize.ENUM('email', 'sms'),
        allowNull: false,
        defaultValue: 'email'
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Users');

    if (table.preferredVerificationChannel) {
      await queryInterface.removeColumn('Users', 'preferredVerificationChannel');
    }

    if (table.preferredLanguage) {
      await queryInterface.removeColumn('Users', 'preferredLanguage');
    }
  }
};
