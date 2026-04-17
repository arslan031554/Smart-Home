'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Offers
    await queryInterface.createTable('Offers', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      projectId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      offerNumber: { type: Sequelize.STRING, allowNull: false, unique: true },
      status: { type: Sequelize.ENUM('draft', 'in_progress', 'offer_ready', 'waiting', 'ordered', 'cancelled'), defaultValue: 'draft' },
      customerComments: { type: Sequelize.TEXT },
      productsSubtotal: { type: Sequelize.FLOAT, defaultValue: 0 },
      servicesSubtotal: { type: Sequelize.FLOAT, defaultValue: 0 },
      discountPercent: { type: Sequelize.FLOAT, defaultValue: 0 },
      discountAmount: { type: Sequelize.FLOAT, defaultValue: 0 },
      grandTotal: { type: Sequelize.FLOAT, defaultValue: 0 },
      generatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // OfferProducts
    await queryInterface.createTable('OfferProducts', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      offerId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Offers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      productId: { type: Sequelize.UUID, allowNull: false },
      productCode: { type: Sequelize.STRING, allowNull: false },
      productName: { type: Sequelize.STRING, allowNull: false },
      productDescription: { type: Sequelize.TEXT },
      rangeName: { type: Sequelize.STRING },
      colorName: { type: Sequelize.STRING },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      unitPrice: { type: Sequelize.FLOAT, defaultValue: 0 },
      subtotal: { type: Sequelize.FLOAT, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // OfferServices
    await queryInterface.createTable('OfferServices', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      offerId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Offers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      serviceId: { type: Sequelize.UUID, allowNull: false },
      serviceName: { type: Sequelize.STRING, allowNull: false },
      pricingMode: { type: Sequelize.STRING, allowNull: false },
      calcQty: { type: Sequelize.INTEGER, defaultValue: 1 },
      unitPrice: { type: Sequelize.FLOAT, defaultValue: 0 },
      subtotal: { type: Sequelize.FLOAT, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // OfferFollowups
    await queryInterface.createTable('OfferFollowups', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      offerId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Offers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      enabled: { type: Sequelize.BOOLEAN, defaultValue: true },
      channelEmail: { type: Sequelize.BOOLEAN, defaultValue: true },
      channelSms: { type: Sequelize.BOOLEAN, defaultValue: false },
      lastReminderAt: { type: Sequelize.DATE },
      nextReminderAt: { type: Sequelize.DATE },
      pattern: { type: Sequelize.STRING },
      reason: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING, defaultValue: 'pending' },
      snoozedUntil: { type: Sequelize.DATE },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OfferFollowups');
    await queryInterface.dropTable('OfferServices');
    await queryInterface.dropTable('OfferProducts');
    await queryInterface.dropTable('Offers');
  }
};
