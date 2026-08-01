'use strict';

function getTableNames(tables) {
  return tables.map((table) => {
    if (typeof table === 'string') return table;
    return table?.tableName || table?.name;
  }).filter(Boolean);
}

async function tableExists(queryInterface, tableName) {
  const tableNames = getTableNames(await queryInterface.showAllTables());
  return tableNames.includes(tableName);
}

async function describeTableOrNull(queryInterface, tableName) {
  try {
    return await queryInterface.describeTable(tableName);
  } catch (_) {
    return null;
  }
}

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  const table = await describeTableOrNull(queryInterface, tableName);
  if (!table || table[columnName]) return;
  await queryInterface.addColumn(tableName, columnName, definition);
}

async function removeColumnIfExists(queryInterface, tableName, columnName) {
  const table = await describeTableOrNull(queryInterface, tableName);
  if (table?.[columnName]) {
    await queryInterface.removeColumn(tableName, columnName);
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await tableExists(queryInterface, 'OfferFiles'))) {
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
    }

    await queryInterface.addIndex('OfferFiles', ['offerId', 'fileType']).catch(() => {});
    await queryInterface.addIndex('OfferFiles', ['projectId']).catch(() => {});
    await queryInterface.addIndex('OfferFiles', ['userId']).catch(() => {});

    await addColumnIfMissing(queryInterface, 'Offers', 'pdfFileId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'OfferFiles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await addColumnIfMissing(queryInterface, 'Offers', 'excelFileId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'OfferFiles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await addColumnIfMissing(queryInterface, 'Offers', 'pdfFilePath', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'Offers', 'excelFilePath', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, 'Offers', 'excelFilePath');
    await removeColumnIfExists(queryInterface, 'Offers', 'pdfFilePath');
    await removeColumnIfExists(queryInterface, 'Offers', 'excelFileId');
    await removeColumnIfExists(queryInterface, 'Offers', 'pdfFileId');
    if (await tableExists(queryInterface, 'OfferFiles')) {
      await queryInterface.dropTable('OfferFiles');
    }
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_OfferFiles_fileType";');
  },
};