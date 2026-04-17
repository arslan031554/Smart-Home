'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ProductRanges
    await queryInterface.createTable('ProductRanges', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT },
      imageUrl: { type: Sequelize.STRING },
      isVisible: { type: Sequelize.BOOLEAN, defaultValue: true },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // Colors
    await queryInterface.createTable('Colors', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT },
      imageUrl: { type: Sequelize.STRING },
      isVisible: { type: Sequelize.BOOLEAN, defaultValue: true },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // Products
    await queryInterface.createTable('Products', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      imageUrl: { type: Sequelize.STRING },
      unitPriceEurExVat: { type: Sequelize.FLOAT, defaultValue: 0 },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // ProductRangeProducts
    await queryInterface.createTable('ProductRangeProducts', {
      productId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      productRangeId: { type: Sequelize.UUID, allowNull: false, references: { model: 'ProductRanges', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' }
    });

    // ProductColorProducts
    await queryInterface.createTable('ProductColorProducts', {
      productId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      colorId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Colors', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' }
    });

    // ProductFunctionMappings
    await queryInterface.createTable('ProductFunctionMappings', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      productId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      smartFunctionId: { type: Sequelize.UUID, allowNull: false, references: { model: 'SmartFunctions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      channelType: { type: Sequelize.ENUM('IN', 'OUT', 'GENERAL'), defaultValue: 'GENERAL' },
      capacity: { type: Sequelize.INTEGER, defaultValue: 1 },
      priority: { type: Sequelize.INTEGER, defaultValue: 0 },
      calculationScope: { type: Sequelize.ENUM('room', 'level', 'project'), defaultValue: 'room' },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // Services
    await queryInterface.createTable('Services', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      pricingMode: { type: Sequelize.ENUM('fixed_project', 'per_room', 'per_level', 'per_product_qty', 'per_function_qty'), defaultValue: 'fixed_project' },
      unitPriceEurExVat: { type: Sequelize.FLOAT, defaultValue: 0 },
      isOptionalForCustomer: { type: Sequelize.BOOLEAN, defaultValue: true },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // DiscountRules
    await queryInterface.createTable('DiscountRules', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      minMultiplier: { type: Sequelize.FLOAT, defaultValue: 0 },
      maxMultiplier: { type: Sequelize.FLOAT, defaultValue: 1000 },
      discountPercent: { type: Sequelize.FLOAT, defaultValue: 0 },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DiscountRules');
    await queryInterface.dropTable('Services');
    await queryInterface.dropTable('ProductFunctionMappings');
    await queryInterface.dropTable('ProductColorProducts');
    await queryInterface.dropTable('ProductRangeProducts');
    await queryInterface.dropTable('Products');
    await queryInterface.dropTable('Colors');
    await queryInterface.dropTable('ProductRanges');
  }
};
