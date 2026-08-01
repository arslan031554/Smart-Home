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

async function addColumnIfMissing(queryInterface, Sequelize, tableName, columnName, definition) {
    const table = await describeTableOrNull(queryInterface, tableName);
    if (!table || table[columnName]) return false;
    await queryInterface.addColumn(tableName, columnName, definition);
    return true;
}

async function removeColumnIfExists(queryInterface, tableName, columnName) {
    const table = await describeTableOrNull(queryInterface, tableName);
    if (!table || !table[columnName]) return;
    await queryInterface.removeColumn(tableName, columnName);
}

async function createProductDependenciesTable(queryInterface, Sequelize) {
    if (await tableExists(queryInterface, 'ProductDependencies')) return false;

    await queryInterface.createTable('ProductDependencies', {
        id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        main_product_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'Products', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        related_product_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'Products', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        quantity_per_main_product: {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 1,
        },
        createdAt: { allowNull: false, type: Sequelize.DATE },
        updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addConstraint('ProductDependencies', {
        fields: ['main_product_id', 'related_product_id'],
        type: 'unique',
        name: 'product_dependencies_main_related_unique',
    });
    await queryInterface.sequelize.query(`
        ALTER TABLE "ProductDependencies"
        ADD CONSTRAINT "product_dependencies_no_self_reference"
        CHECK ("main_product_id" <> "related_product_id")
    `);
    await queryInterface.addIndex('ProductDependencies', ['main_product_id'], { name: 'product_dependencies_main_product_idx' });
    await queryInterface.addIndex('ProductDependencies', ['related_product_id'], { name: 'product_dependencies_related_product_idx' });
    return true;
}

async function createProductRangeColorsTable(queryInterface, Sequelize) {
    if (await tableExists(queryInterface, 'ProductRangeColors')) return false;

    await queryInterface.createTable('ProductRangeColors', {
        id: { allowNull: false, primaryKey: true, type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 },
        product_range_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'ProductRanges', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        color_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'Colors', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        createdAt: { allowNull: false, type: Sequelize.DATE },
        updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addConstraint('ProductRangeColors', {
        fields: ['product_range_id', 'color_id'],
        type: 'unique',
        name: 'product_range_colors_range_color_unique',
    });
    await queryInterface.addIndex('ProductRangeColors', ['product_range_id'], { name: 'product_range_colors_range_idx' });
    await queryInterface.addIndex('ProductRangeColors', ['color_id'], { name: 'product_range_colors_color_idx' });
    return true;
}

async function backfillRangeColors(queryInterface) {
    await queryInterface.sequelize.query(`
        INSERT INTO "ProductRangeColors" ("id", "product_range_id", "color_id", "createdAt", "updatedAt")
        SELECT (
            substr(md5(pr."id"::text || ':' || c."id"::text), 1, 8) || '-' ||
            substr(md5(pr."id"::text || ':' || c."id"::text), 9, 4) || '-' ||
            substr(md5(pr."id"::text || ':' || c."id"::text), 13, 4) || '-' ||
            substr(md5(pr."id"::text || ':' || c."id"::text), 17, 4) || '-' ||
            substr(md5(pr."id"::text || ':' || c."id"::text), 21, 12)
        )::uuid,
        pr."id", c."id", NOW(), NOW()
        FROM "ProductRanges" pr
        CROSS JOIN "Colors" c
        WHERE COALESCE(pr."isActive", true) = true
          AND COALESCE(c."isActive", true) = true
          AND COALESCE(c."isVisible", true) = true
        ON CONFLICT DO NOTHING
    `);
}

async function countRows(queryInterface, tableName) {
    const [rows] = await queryInterface.sequelize.query(`SELECT COUNT(*)::int AS count FROM "${tableName}"`);
    return Number(rows?.[0]?.count || 0);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await addColumnIfMissing(queryInterface, Sequelize, 'Products', 'productType', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'STANDARD',
        });

        await createProductDependenciesTable(queryInterface, Sequelize);

        const createdRangeColors = await createProductRangeColorsTable(queryInterface, Sequelize);
        if (createdRangeColors || await countRows(queryInterface, 'ProductRangeColors') === 0) {
            await backfillRangeColors(queryInterface);
        }

        await addColumnIfMissing(queryInterface, Sequelize, 'OfferProducts', 'lineType', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'STANDARD',
        });
    },

    async down(queryInterface) {
        await removeColumnIfExists(queryInterface, 'OfferProducts', 'lineType');
        if (await tableExists(queryInterface, 'ProductRangeColors')) {
            await queryInterface.dropTable('ProductRangeColors');
        }
        if (await tableExists(queryInterface, 'ProductDependencies')) {
            await queryInterface.dropTable('ProductDependencies');
        }
        await removeColumnIfExists(queryInterface, 'Products', 'productType');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_OfferProducts_lineType";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Products_productType";');
    }
};