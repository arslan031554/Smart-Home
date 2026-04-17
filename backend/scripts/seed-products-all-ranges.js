/**
 * Add products for every smart function and link them to ALL ranges and ALL colors
 * so that the configurator shows an amount regardless of range/color selection.
 *
 * Run from backend:
 *   node scripts/seed-products-all-ranges.js          — ensure DEMO-* products + links (idempotent)
 *   node scripts/seed-products-all-ranges.js --force  — create extra DEMO2-* products + links
 *
 * If you see "Products created: 0" and "Range links: 0", run seed-master-data.js first,
 * then run this script. If links stay 0, your DB join tables may use different column
 * names; check ProductRangeProducts / ProductColorProducts table structure.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { Op } from 'sequelize';
import sequelize from '../src/config/database.js';
import models from '../models/index.js';

const {
    Product,
    SmartFunction,
    ProductFunctionMapping,
    ProductRange,
    Color,
    ProductRangeProduct,
    ProductColorProduct,
} = models;

// Resolve join table and column names (PostgreSQL: names can be lower/camelCase)
let rangeTableName = null;
let rangeTableCols = null;
let colorTableName = null;
let colorTableCols = null;

async function getRangeTableInfo() {
    if (rangeTableName && rangeTableCols) return { tableName: rangeTableName, cols: rangeTableCols };
    const candidates = ['ProductRangeProducts', 'productrangeproducts', 'ProductRangeProduct', 'product_range_products'];
    let t = null;
    for (const name of candidates) {
        const [rows] = await sequelize.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = :name LIMIT 1`,
            { replacements: { name } }
        );
        if (rows?.length > 0) {
            t = rows[0].table_name;
            break;
        }
    }
    if (!t) {
        const [all] = await sequelize.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%product%' ORDER BY table_name`
        );
        t = (all || []).find((r) => /range/i.test(r.table_name))?.table_name || 'ProductRangeProducts';
    }
    rangeTableName = t;
    const allCols = await sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = :t ORDER BY ordinal_position`,
        { replacements: { t } }
    );
    rangeTableCols = (allCols[0] || []).map((r) => r.column_name);
    return { tableName: rangeTableName, cols: rangeTableCols };
}

async function getColorTableInfo() {
    if (colorTableName && colorTableCols) return { tableName: colorTableName, cols: colorTableCols };
    const candidates = ['ProductColorProducts', 'productcolorproducts', 'ProductColorProduct', 'product_color_products'];
    let t = null;
    for (const name of candidates) {
        const [rows] = await sequelize.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = :name LIMIT 1`,
            { replacements: { name } }
        );
        if (rows?.length > 0) {
            t = rows[0].table_name;
            break;
        }
    }
    if (!t) {
        const [all] = await sequelize.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%product%' AND table_name LIKE '%color%' ORDER BY table_name`
        );
        t = (all || [])[0]?.table_name || 'ProductColorProducts';
    }
    colorTableName = t;
    const allCols = await sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = :t ORDER BY ordinal_position`,
        { replacements: { t } }
    );
    colorTableCols = (allCols[0] || []).map((r) => r.column_name);
    return { tableName: colorTableName, cols: colorTableCols };
}

function quoteId(name) {
    return `"${name}"`;
}

async function ensureProductRangeLink(productId, productRangeId) {
    try {
        const [_, created] = await ProductRangeProduct.findOrCreate({
            where: { productId, productRangeId },
            defaults: { productId, productRangeId },
        });
        return !!created;
    } catch (err) {
        const { tableName, cols } = await getRangeTableInfo();
        if (!cols?.length) {
            console.error('[seed-products-all-ranges] ProductRange link failed (model) and no join table cols found:', err?.message);
            return false;
        }
        const pCol = cols.find((c) => /product.?id/i.test(c) && !/range/i.test(c)) || cols[0];
        const rCol = cols.find((c) => /range/i.test(c) || c === 'product_range_id' || c === 'productRangeId') || cols[1];
        if (!pCol || !rCol) return false;
        const q = (s) => (s.includes('-') || /[A-Z]/.test(s) ? quoteId(s) : s);
        const [existing] = await sequelize.query(
            `SELECT 1 FROM ${q(tableName)} WHERE ${q(pCol)} = :productId AND ${q(rCol)} = :productRangeId LIMIT 1`,
            { replacements: { productId, productRangeId } }
        );
        if (existing?.length > 0) return false;
        await sequelize.query(
            `INSERT INTO ${q(tableName)} (${q(pCol)}, ${q(rCol)}) VALUES (:productId, :productRangeId)`,
            { replacements: { productId, productRangeId } }
        );
        return true;
    }
}

async function ensureProductColorLink(productId, colorId) {
    try {
        const [_, created] = await ProductColorProduct.findOrCreate({
            where: { productId, colorId },
            defaults: { productId, colorId },
        });
        return !!created;
    } catch (err) {
        const { tableName, cols } = await getColorTableInfo();
        if (!cols?.length) {
            console.error('[seed-products-all-ranges] ProductColor link failed (model) and no join table cols found:', err?.message);
            return false;
        }
        const pCol = cols.find((c) => /product.?id/i.test(c) && !/color/i.test(c)) || cols[0];
        const cCol = cols.find((c) => /color/i.test(c) || c === 'color_id' || c === 'colorId') || cols[1];
        if (!pCol || !cCol) return false;
        const q = (s) => (s.includes('-') || /[A-Z]/.test(s) ? quoteId(s) : s);
        const [existing] = await sequelize.query(
            `SELECT 1 FROM ${q(tableName)} WHERE ${q(pCol)} = :productId AND ${q(cCol)} = :colorId LIMIT 1`,
            { replacements: { productId, colorId } }
        );
        if (existing?.length > 0) return false;
        await sequelize.query(
            `INSERT INTO ${q(tableName)} (${q(pCol)}, ${q(cCol)}) VALUES (:productId, :colorId)`,
            { replacements: { productId, colorId } }
        );
        return true;
    }
}

async function main() {
    await sequelize.authenticate();
    console.log('[seed-products-all-ranges] DB connected.');

    const smartFunctions = await SmartFunction.findAll({
        where: { isActive: true },
        order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });
    const ranges = await ProductRange.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']],
    });
    const colors = await Color.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']],
    });

    if (!smartFunctions?.length) {
        console.log('[seed-products-all-ranges] No SmartFunctions. Run seed-master-data.js first.');
        process.exit(1);
    }
    if (!ranges?.length) {
        console.log('[seed-products-all-ranges] No ProductRanges. Run seed-master-data.js first.');
        process.exit(1);
    }
    if (!colors?.length) {
        console.log('[seed-products-all-ranges] No Colors. Run seed-master-data.js first.');
        process.exit(1);
    }

    const force = process.argv.includes('--force');
    if (force) console.log('[seed-products-all-ranges] --force: using DEMO2- prefix to create new products.');

    let productsCreated = 0;
    let rangeLinks = 0;
    let colorLinks = 0;
    let mappingsCreated = 0;

    for (const sf of smartFunctions) {
        const prefix = force ? 'DEMO2' : 'DEMO';
        const codePrefix = `${prefix}-${(sf.code || 'F').toString().toUpperCase().slice(0, 8)}`;

        // One product per channel/scope combo so calculation can allocate (room + level)
        const specs = [
            { suffix: 'IN4', name: `Demo ${sf.name} (Room)`, channelType: 'IN', capacity: 4, priority: 10, calculationScope: 'room', price: 35 },
            { suffix: 'OUT8', name: `Demo ${sf.name} (Level)`, channelType: 'OUT', capacity: 8, priority: 20, calculationScope: 'level', price: 85 },
            { suffix: 'GEN1', name: `Demo ${sf.name} (Project)`, channelType: 'GENERAL', capacity: 1, priority: 5, calculationScope: 'project', price: 120 },
        ];

        for (const spec of specs) {
            const code = `${codePrefix}-${spec.suffix}`;
            const [product, created] = await Product.findOrCreate({
                where: { code },
                defaults: {
                    code,
                    name: spec.name,
                    description: `Demo product for "${sf.name}" – visible in all ranges/colors.`,
                    unitPriceEurExVat: spec.price,
                    isActive: true,
                },
            });
            if (created) productsCreated++;

            // Link to ALL ranges (raw SQL for DB column name compatibility)
            for (const range of ranges) {
                if (await ensureProductRangeLink(product.id, range.id)) rangeLinks++;
            }

            // Link to ALL colors (raw SQL for DB column name compatibility)
            for (const color of colors) {
                if (await ensureProductColorLink(product.id, color.id)) colorLinks++;
            }

            // Function mapping
            const mappingExists = await ProductFunctionMapping.findOne({
                where: {
                    productId: product.id,
                    smartFunctionId: sf.id,
                    channelType: spec.channelType,
                    calculationScope: spec.calculationScope,
                },
            });
            if (!mappingExists) {
                await ProductFunctionMapping.create({
                    productId: product.id,
                    smartFunctionId: sf.id,
                    channelType: spec.channelType,
                    capacity: spec.capacity,
                    priority: spec.priority,
                    calculationScope: spec.calculationScope,
                    isActive: true,
                });
                mappingsCreated++;
            }
        }
    }

    console.log('[seed-products-all-ranges] Done.');
    console.log(`  Smart functions: ${smartFunctions.length}`);
    console.log(`  Ranges: ${ranges.length}, Colors: ${colors.length}`);
    console.log(`  Products created: ${productsCreated}`);
    console.log(`  Product–range links added: ${rangeLinks}`);
    console.log(`  Product–color links added: ${colorLinks}`);
    console.log(`  Function mappings created: ${mappingsCreated}`);
    if (productsCreated === 0 && rangeLinks === 0 && colorLinks === 0 && mappingsCreated === 0) {
        const totalProducts = await Product.count({ where: { code: { [Op.like]: 'DEMO%' } } });
        let totalRangeLinks = 0;
        try {
            const [r] = await sequelize.query('SELECT COUNT(*) AS c FROM "ProductRangeProducts"');
            totalRangeLinks = Number(r?.[0]?.c ?? 0);
        } catch {
            try {
                const [r] = await sequelize.query('SELECT COUNT(*) AS c FROM ProductRangeProducts');
                totalRangeLinks = Number(r?.[0]?.c ?? 0);
            } catch (_) {}
        }
        console.log('');
        console.log('  All counts 0: demo data may already exist.');
        console.log(`  Existing DEMO* products: ${totalProducts}. Range links: ${totalRangeLinks}.`);
        console.log('  To add fresh data run: node scripts/seed-products-all-ranges.js --force');
    }
    process.exit(0);
}

main().catch((err) => {
    console.error('[seed-products-all-ranges] Error:', err?.message || err);
    process.exit(1);
});
