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

function pickFirst(arr) {
    return Array.isArray(arr) && arr.length ? arr[0] : null;
}

async function main() {
    await sequelize.authenticate();

    const smartFunctions = await SmartFunction.findAll({
        where: { isActive: true },
        order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });
    if (!smartFunctions || smartFunctions.length === 0) {
        console.log('[seed] No active SmartFunctions found. Create at least one Smart Function first.');
        return;
    }

    const ranges = await ProductRange.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
    });
    const colors = await Color.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
    });

    // Distribute seed products across available master data so filtering demos are realistic.
    const pickByIndex = (arr, idx) => (Array.isArray(arr) && arr.length ? arr[idx % arr.length] : null);

    const ensureProduct = async ({ smartFn, code, name, price, range, color }) => {
        const [p] = await Product.findOrCreate({
            where: { code },
            defaults: {
                code,
                name,
                description: `[SEED/INTERNAL] Auto-created demo product so calculation can allocate hardware for "${smartFn.name}". Replace with real products.`,
                unitPriceEurExVat: price,
                isActive: true,
            }
        });
        if (range) {
            await ProductRangeProduct.findOrCreate({ where: { productId: p.id, productRangeId: range.id }, defaults: { productId: p.id, productRangeId: range.id } });
        }
        if (color) {
            await ProductColorProduct.findOrCreate({ where: { productId: p.id, colorId: color.id }, defaults: { productId: p.id, colorId: color.id } });
        }
        return p;
    };

    const ensureMapping = async ({ smartFn, productId, channelType, capacity, calculationScope, priority }) => {
        const exists = await ProductFunctionMapping.findOne({
            where: { productId, smartFunctionId: smartFn.id, channelType, capacity, calculationScope, isActive: true }
        });
        if (exists) return false;
        await ProductFunctionMapping.create({
            productId,
            smartFunctionId: smartFn.id,
            channelType,
            capacity,
            priority,
            calculationScope,
            isActive: true,
        });
        return true;
    };

    let createdMappings = 0;

    for (let idx = 0; idx < smartFunctions.length; idx++) {
        const smartFn = smartFunctions[idx];
        const seedKey = String(smartFn.code || smartFn.name || 'FUNC').toUpperCase().replace(/\s+/g, '-').slice(0, 20);
        const range = pickByIndex(ranges, idx);
        const color = pickByIndex(colors, idx);

        // OUT/level products for the client's example-like flow (16, 8, 4)
        const pOut16 = await ensureProduct({ smartFn, range, color, code: `SEED-${seedKey}-OUT16`, name: `Seed/Internal (${smartFn.name}) OUT16`, price: 100 });
        const pOut8 = await ensureProduct({ smartFn, range, color, code: `SEED-${seedKey}-OUT8`, name: `Seed/Internal (${smartFn.name}) OUT8`, price: 70 });
        const pOut4 = await ensureProduct({ smartFn, range, color, code: `SEED-${seedKey}-OUT4`, name: `Seed/Internal (${smartFn.name}) OUT4`, price: 45 });
        const pIn4 = await ensureProduct({ smartFn, range, color, code: `SEED-${seedKey}-IN4`, name: `Seed/Internal (${smartFn.name}) IN4`, price: 30 });
        const pGen32 = await ensureProduct({ smartFn, range, color, code: `SEED-${seedKey}-GEN32`, name: `Seed/Internal (${smartFn.name}) GEN32`, price: 180 });

        createdMappings += (await ensureMapping({ smartFn, productId: pOut16.id, channelType: 'OUT', capacity: 16, priority: 30, calculationScope: 'level' })) ? 1 : 0;
        createdMappings += (await ensureMapping({ smartFn, productId: pOut8.id, channelType: 'OUT', capacity: 8, priority: 20, calculationScope: 'level' })) ? 1 : 0;
        createdMappings += (await ensureMapping({ smartFn, productId: pOut4.id, channelType: 'OUT', capacity: 4, priority: 10, calculationScope: 'level' })) ? 1 : 0;
        createdMappings += (await ensureMapping({ smartFn, productId: pIn4.id, channelType: 'IN', capacity: 4, priority: 10, calculationScope: 'room' })) ? 1 : 0;
        createdMappings += (await ensureMapping({ smartFn, productId: pGen32.id, channelType: 'GENERAL', capacity: 32, priority: 10, calculationScope: 'project' })) ? 1 : 0;
    }

    console.log('[seed] Done (all active SmartFunctions).');
    console.log(`[seed] SmartFunctions processed: ${smartFunctions.length}`);
    console.log(`[seed] Mappings newly added (idempotent): ${createdMappings}`);
    console.log(`[seed] Ranges available: ${ranges.length}`);
    console.log(`[seed] Colors available: ${colors.length}`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error('[seed] Failed:', e?.message || e);
        process.exit(1);
    });

