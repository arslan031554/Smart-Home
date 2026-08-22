import 'dotenv/config';
import app from './app.js';
import sequelize from './config/database.js';
import '../models/index.js'; // Initialize models and associations
import { initFollowupCron } from './services/followupservice.js';
import { DataTypes } from 'sequelize';
import { randomUUID } from 'crypto';
import { getNotificationIntegrationStatus } from './services/notificationservice.js';
import { getRecaptchaDiagnostics } from './security/recaptcha.js';

if (false && process.env.NODE_ENV === 'production') {

const REQUIRED_ENV = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

if (false && process.env.NODE_ENV === 'production') {
    const requiredProductionEnv = ['FRONTEND_URL', 'CORS_ORIGIN'];
    const missingProduction = requiredProductionEnv.filter((key) => !process.env[key]);
    if (missingProduction.length > 0) {
        console.error(`FATAL: Missing production environment variables: ${missingProduction.join(', ')}`);
        process.exit(1);
    }

    const recaptcha = getRecaptchaDiagnostics();
    const notifications = getNotificationIntegrationStatus();
    const issues = [];

    if (!recaptcha.productionReady) {
        issues.push('reCAPTCHA is not production-ready.');
    }
    if (notifications.email.mode !== 'live') {
        issues.push(`Email integration is not production-ready: ${notifications.email.reason || notifications.email.mode}`);
    }
    if (notifications.sms.mode !== 'live') {
        issues.push(`SMS integration is not production-ready: ${notifications.sms.reason || notifications.sms.mode}`);
    }

    if (issues.length > 0) {
        console.error('FATAL: Integration validation failed:');
        issues.forEach((issue) => console.error(`- ${issue}`));
        process.exit(1);
    }
}
}

const PORT = process.env.PORT || 5000;

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
    if (!table || table[columnName]) return false;
    await queryInterface.addColumn(tableName, columnName, definition);
    return true;
}

async function createProductDependenciesTable(queryInterface) {
    if (await tableExists(queryInterface, 'ProductDependencies')) return false;

    await queryInterface.createTable('ProductDependencies', {
        id: { allowNull: false, primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        main_product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Products', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        related_product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Products', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        quantity_per_main_product: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 1,
        },
        createdAt: { allowNull: false, type: DataTypes.DATE },
        updatedAt: { allowNull: false, type: DataTypes.DATE },
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

async function createProductRangeColorsTable(queryInterface) {
    if (await tableExists(queryInterface, 'ProductRangeColors')) return false;

    await queryInterface.createTable('ProductRangeColors', {
        id: { allowNull: false, primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        product_range_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'ProductRanges', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        color_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Colors', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        createdAt: { allowNull: false, type: DataTypes.DATE },
        updatedAt: { allowNull: false, type: DataTypes.DATE },
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

async function backfillProductRangeColors() {
    const [ranges] = await sequelize.query(`
        SELECT "id"
        FROM "ProductRanges"
        WHERE COALESCE("isActive", true) = true
    `);
    const [colors] = await sequelize.query(`
        SELECT "id"
        FROM "Colors"
        WHERE COALESCE("isActive", true) = true
          AND COALESCE("isVisible", true) = true
    `);
    const now = new Date();
    const rows = [];

    for (const range of ranges || []) {
        for (const color of colors || []) {
            rows.push({
                id: randomUUID(),
                product_range_id: range.id,
                color_id: color.id,
                createdAt: now,
                updatedAt: now,
            });
        }
    }

    if (rows.length > 0) {
        await sequelize.getQueryInterface().bulkInsert('ProductRangeColors', rows);
    }
}

async function createOfferFilesTable(queryInterface) {
    if (await tableExists(queryInterface, 'OfferFiles')) return false;

    await queryInterface.createTable('OfferFiles', {
        id: { allowNull: false, primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        fileType: { type: DataTypes.STRING, allowNull: false },
        originalFilename: { type: DataTypes.STRING, allowNull: false },
        generatedFilename: { type: DataTypes.STRING, allowNull: false },
        storagePath: { type: DataTypes.STRING, allowNull: false },
        offerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Offers', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        projectId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Projects', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        createdAt: { allowNull: false, type: DataTypes.DATE },
        updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('OfferFiles', ['offerId', 'fileType']).catch(() => {});
    await queryInterface.addIndex('OfferFiles', ['projectId']).catch(() => {});
    await queryInterface.addIndex('OfferFiles', ['userId']).catch(() => {});
    return true;
}

async function createOfferFollowupsTable(queryInterface) {
    if (await tableExists(queryInterface, 'OfferFollowups')) return false;

    await queryInterface.createTable('OfferFollowups', {
        id: { allowNull: false, primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        offerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Offers', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
        channelEmail: { type: DataTypes.BOOLEAN, defaultValue: true },
        channelSms: { type: DataTypes.BOOLEAN, defaultValue: false },
        lastReminderAt: { type: DataTypes.DATE, allowNull: true },
        nextReminderAt: { type: DataTypes.DATE, allowNull: true },
        pattern: { type: DataTypes.STRING, allowNull: true },
        reason: { type: DataTypes.STRING, allowNull: true },
        status: { type: DataTypes.STRING, defaultValue: 'pending' },
        snoozedUntil: { type: DataTypes.DATE, allowNull: true },
        createdAt: { allowNull: false, type: DataTypes.DATE },
        updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    return true;
}

const REQUIRED_OFFER_STATUSES = [
    'draft',
    'in_progress',
    'offer_generated',
    'ordered',
    'cancelled',
];

async function ensureOfferStatusEnum(queryInterface) {
    if (!(await tableExists(queryInterface, 'Offers'))) return [];

    const [rows] = await queryInterface.sequelize.query(`
        SELECT
            type_namespace.nspname AS "schemaName",
            type_definition.typname AS "typeName",
            enum_value.enumlabel AS "enumValue"
        FROM pg_attribute column_definition
        JOIN pg_class table_definition
          ON table_definition.oid = column_definition.attrelid
        JOIN pg_type type_definition
          ON type_definition.oid = column_definition.atttypid
        JOIN pg_namespace type_namespace
          ON type_namespace.oid = type_definition.typnamespace
        LEFT JOIN pg_enum enum_value
          ON enum_value.enumtypid = type_definition.oid
        WHERE table_definition.oid = to_regclass('"Offers"')
          AND column_definition.attname = 'status'
          AND column_definition.attnum > 0
          AND NOT column_definition.attisdropped
          AND type_definition.typtype = 'e'
        ORDER BY enum_value.enumsortorder
    `);

    if (!rows?.length) return [];

    const { schemaName, typeName } = rows[0];
    const existingValues = new Set(rows.map((row) => row.enumValue).filter(Boolean));
    const missingValues = REQUIRED_OFFER_STATUSES.filter((value) => !existingValues.has(value));
    if (!missingValues.length) return [];

    const quoteIdentifier = (value) => queryInterface.queryGenerator.quoteIdentifier(value);
    const qualifiedType = `${quoteIdentifier(schemaName)}.${quoteIdentifier(typeName)}`;

    for (const value of missingValues) {
        const escapedValue = queryInterface.sequelize.escape(value);
        await queryInterface.sequelize.query(
            `ALTER TYPE ${qualifiedType} ADD VALUE IF NOT EXISTS ${escapedValue}`
        );
    }

    return missingValues;
}

async function ensureOfferSchema(queryInterface) {
    const patched = [];

    const addedOfferStatuses = await ensureOfferStatusEnum(queryInterface);
    if (addedOfferStatuses.length) {
        patched.push(`Offers.status enum (${addedOfferStatuses.join(', ')})`);
    }

    if (await createOfferFollowupsTable(queryInterface)) {
        patched.push('OfferFollowups');
    }

    if (await createOfferFilesTable(queryInterface)) {
        patched.push('OfferFiles');
    }

    if (await addColumnIfMissing(queryInterface, 'Offers', 'calculationSnapshot', {
        type: DataTypes.JSONB,
        allowNull: true
    })) {
        patched.push('Offers.calculationSnapshot');
    }

    if (await addColumnIfMissing(queryInterface, 'Offers', 'pdfFileId', {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'OfferFiles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    })) {
        patched.push('Offers.pdfFileId');
    }

    if (await addColumnIfMissing(queryInterface, 'Offers', 'excelFileId', {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'OfferFiles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    })) {
        patched.push('Offers.excelFileId');
    }

    if (await addColumnIfMissing(queryInterface, 'Offers', 'pdfFilePath', {
        type: DataTypes.STRING,
        allowNull: true
    })) {
        patched.push('Offers.pdfFilePath');
    }

    if (await addColumnIfMissing(queryInterface, 'Offers', 'excelFilePath', {
        type: DataTypes.STRING,
        allowNull: true
    })) {
        patched.push('Offers.excelFilePath');
    }

    if (await addColumnIfMissing(queryInterface, 'Projects', 'projectComplexity', {
        type: DataTypes.STRING,
        allowNull: true
    })) {
        patched.push('Projects.projectComplexity');
    }

    if (patched.length > 0) {
        console.log(`DB patched: ${patched.join(', ')}`);
    }
}

async function ensureProductSchema(queryInterface) {
    const patched = [];

    if (await addColumnIfMissing(queryInterface, 'ProductRanges', 'priceMultiplier', {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.0
    })) {
        patched.push('ProductRanges.priceMultiplier');
    }

    if (await addColumnIfMissing(queryInterface, 'Products', 'productType', {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'STANDARD'
    })) {
        patched.push('Products.productType');
    }

    if (await createProductDependenciesTable(queryInterface)) {
        patched.push('ProductDependencies');
    }

    if (await createProductRangeColorsTable(queryInterface)) {
        await backfillProductRangeColors();
        patched.push('ProductRangeColors');
    }

    if (await addColumnIfMissing(queryInterface, 'OfferProducts', 'lineType', {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'STANDARD'
    })) {
        patched.push('OfferProducts.lineType');
    }

    if (patched.length > 0) {
        console.log(`DB patched: ${patched.join(', ')}`);
    }
}

async function createNewsletterSubscribersTable(queryInterface) {
    if (await tableExists(queryInterface, 'NewsletterSubscribers')) return false;

    await queryInterface.createTable('NewsletterSubscribers', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            unique: true,
        },
        source: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'footer',
        },
        subscribedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdAt: { allowNull: false, type: DataTypes.DATE },
        updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    return true;
}

async function createPortfolioProjectsTable(queryInterface) {
    if (await tableExists(queryInterface, 'PortfolioProjects')) return false;

    await queryInterface.createTable('PortfolioProjects', {
        id: { allowNull: false, primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        title: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
        location: { type: DataTypes.STRING, allowNull: true },
        result: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        images: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
        createdAt: { allowNull: false, type: DataTypes.DATE },
        updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    return true;
}

async function ensureAdminSchema(queryInterface) {
    const patched = [];
    if (await createNewsletterSubscribersTable(queryInterface)) {
        patched.push('NewsletterSubscribers');
    }
    if (await createPortfolioProjectsTable(queryInterface)) {
        patched.push('PortfolioProjects');
    }
    if (patched.length > 0) {
        console.log(`DB patched: ${patched.join(', ')}`);
    }
}

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        try {
            const queryInterface = sequelize.getQueryInterface();
            await ensureOfferSchema(queryInterface);
            await ensureProductSchema(queryInterface);
            await ensureAdminSchema(queryInterface);
        } catch (e) {
            console.warn('DB patch skipped (runtime schema):', e?.message || e);
        }

        // Initialize Cron Jobs
        initFollowupCron();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();