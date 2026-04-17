'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'otpChannel', {
      type: Sequelize.ENUM('sms', 'email'),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'otpChannel');
    // Note: Removing ENUM types in Postgres can be tricky if they are still in use,
    // but for simple migrations removeColumn is usually enough.
  }
};
