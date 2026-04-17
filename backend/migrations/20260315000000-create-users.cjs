'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('customer', 'admin', 'employee'),
        defaultValue: 'customer'
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      invoiceName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      invoiceVat: {
        type: Sequelize.STRING,
        allowNull: true
      },
      invoiceAddress: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      newsletterSubscribed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      termsAccepted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      cookiesAccepted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('Users');
  }
};
