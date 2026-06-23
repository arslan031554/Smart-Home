'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OfferFiles', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
      fileType: { type: Sequelize.ENUM('pdf', 'excel'), allowNull: false },
      originalFilename: { type: Sequelize.STRING, allowNull: false },
      generatedFilename: { type: Sequelize.STRING, allowNull: false },
      storagePath: { type: Sequelize.STRING, allowNull: false },
      offerId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Offers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      projectId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Projects', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      userId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex('OfferFiles', ['offerId', 'fileType']);
    await queryInterface.addIndex('OfferFiles', ['projectId']);
    await queryInterface.addIndex('OfferFiles', ['userId']);

    await queryInterface.addColumn('Offers', 'pdfFileId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'OfferFiles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('Offers', 'excelFileId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'OfferFiles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('Offers', 'pdfFilePath', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Offers', 'excelFilePath', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Offers', 'excelFilePath');
    await queryInterface.removeColumn('Offers', 'pdfFilePath');
    await queryInterface.removeColumn('Offers', 'excelFileId');
    await queryInterface.removeColumn('Offers', 'pdfFileId');
    await queryInterface.dropTable('OfferFiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_OfferFiles_fileType";');
  },
};
