import Product from '../../models/Product.js';
import ProductRangeProduct from '../../models/ProductRangeProduct.js';
import ProductColorProduct from '../../models/ProductColorProduct.js';
import ProductFunctionMapping from '../../models/ProductFunctionMapping.js';
import ProductDependency from '../../models/ProductDependency.js';
import Service from '../../models/Service.js';
import ServiceSmartFunction from '../../models/ServiceSmartFunction.js';
import DiscountRule from '../../models/DiscountRule.js';
import { Op } from 'sequelize';
import { getLocalizedValue, normalizeBusinessLanguage, serializeLocalizedEntity } from '../utils/localization.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const safeNum = (v, def = 0) => (v != null && !Number.isNaN(Number(v)) ? Number(v) : def);
const roundMoney = (value) => Number(safeNum(value).toFixed(2));
const normalizeRoomCount = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

function collectSelectedFunctionIds(levels = []) {
    const ids = new Set();
    (Array.isArray(levels) ? levels : []).forEach((level) => {
        (Array.isArray(level.rooms) ? level.rooms : []).forEach((room) => {
            const selections = Array.isArray(room.functionSelections)
                ? room.functionSelections
                : (Array.isArray(room.functions) ? room.functions : []);
            selections.forEach((selection) => {
                const smartFunctionId = selection?.smartFunctionId ?? selection?.id;
                if (isValidUuid(smartFunctionId)) ids.add(String(smartFunctionId).trim());
            });
        });
    });
    return Array.from(ids);
}

function resolveFunctionDemand(functionMeta = {}, selection = {}) {
    const explicitInput = safeNum(functionMeta?.inputChannelCount, 0);
    const explicitOutput = safeNum(functionMeta?.outputChannelCount, 0);
    const explicitGeneral = safeNum(functionMeta?.generalChannelCount, 0);

    if ((explicitInput + explicitOutput + explicitGeneral) > 0) {
        return {
            input: Math.max(0, explicitInput),
            output: Math.max(0, explicitOutput),
            general: Math.max(0, explicitGeneral),
        };
    }

    const channelType = String(functionMeta?.channelType || selection?.channelType || 'GENERAL').toUpperCase();
    return {
        input: channelType === 'IN' ? 1 : 0,
        output: channelType === 'OUT' ? 1 : 0,
        general: channelType === 'GENERAL' ? 1 : 0,
    };
}


function summarizeRequirements(requirements = {}) {
    const summary = { room: {}, level: {}, project: {} };
    ['room', 'level', 'project'].forEach((scope) => {
        const scopeData = requirements?.[scope] || {};
        Object.values(scopeData).forEach((entityReqs) => {
            Object.entries(entityReqs || {}).forEach(([funcId, qty]) => {
                summary[scope][funcId] = (summary[scope][funcId] || 0) + Math.max(0, safeNum(qty));
            });
        });
    });
    return summary;
}

const normalizeLevels = (levels) => (Array.isArray(levels) ? levels : []).map(level => ({
    ...level,
    rooms: (Array.isArray(level.rooms) ? level.rooms : []).map(room => ({
        ...room,
        roomCount: normalizeRoomCount(room.roomCount ?? room.count),
        functionSelections: (Array.isArray(room.functionSelections) ? room.functionSelections : (Array.isArray(room.functions) ? room.functions : [])).map(selection => ({
            ...selection,
            smartFunctionId: isValidUuid(selection.smartFunctionId ?? selection.id) ? String(selection.smartFunctionId ?? selection.id).trim() : null,
            quantity: normalizeRoomCount(selection.quantity),
        })),
    })),
}));

function buildCalculatedProducts(products, { rangeMultiplier = 1.0, multiplicationIndex = 1.0 }) {
    const rangeMult = Math.max(0.01, Math.min(100, safeNum(rangeMultiplier, 1.0)));
    const units = Math.max(1, Math.round(safeNum(multiplicationIndex, 1.0)));

    return (Array.isArray(products) ? products : []).map((product) => {
        const quantity = Math.max(0, safeNum(product?.quantity));
        const baseUnitPrice = safeNum(product?.unitPrice);
        const baseSubtotal = roundMoney(quantity * baseUnitPrice);
        const unitPrice = roundMoney(baseUnitPrice * rangeMult);
        const subtotal = roundMoney(quantity * unitPrice);

        return {
            ...product,
            baseUnitPrice,
            baseSubtotal,
            unitPrice,
            subtotal,
            totalQuantity: quantity * units,
            subtotalAllProjects: roundMoney(subtotal * units),
        };
    });
}

function buildCalculatedServices(services, { multiplicationIndex = 1.0 }) {
    const units = Math.max(1, Math.round(safeNum(multiplicationIndex, 1.0)));

    return (Array.isArray(services) ? services : []).map((service) => {
        const calcQty = Math.max(0, safeNum(service?.calcQty, 1));
        const unitPrice = safeNum(service?.unitPrice);
        const subtotal = roundMoney(calcQty * unitPrice);

        return {
            ...service,
            unitPrice,
            subtotal,
            totalQuantity: calcQty * units,
            subtotalAllProjects: roundMoney(subtotal * units),
        };
    });
}

/**
 * Core calculation engine hardened for malformed payloads and missing data.
 */
export const calculateOffer = async (projectData) => {
    if (!projectData || typeof projectData !== 'object') {
        throw new Error('Invalid project data');
    }
    const levels = normalizeLevels(projectData.levels);
    const selectedRangeId = isValidUuid(projectData.selectedRangeId || projectData.rangeId) ? (projectData.selectedRangeId || projectData.rangeId) : null;
    const selectedColorId = isValidUuid(projectData.selectedColorId || projectData.colorId) ? (projectData.selectedColorId || projectData.colorId) : null;
    const multiplicationIndex = Math.max(0.01, Math.min(100, safeNum(projectData.multiplicationIndex, 1.0)));
    const selectedServiceIds = Array.isArray(projectData.selectedServiceIds)
        ? projectData.selectedServiceIds.map((id) => (isValidUuid(id) ? String(id).trim() : null)).filter(Boolean)
        : [];
    const language = normalizeBusinessLanguage(projectData.language);

    const compatibleProductIds = await getCompatibleProductIds(selectedRangeId, selectedColorId);
    const { SmartFunction } = (await import('../../models/index.js')).default;
    const selectedFunctionIds = collectSelectedFunctionIds(levels);
    const smartFunctionRows = selectedFunctionIds.length
        ? await SmartFunction.findAll({
            where: { id: { [Op.in]: selectedFunctionIds } },
            attributes: ['id', 'channelType', 'inputChannelCount', 'outputChannelCount', 'generalChannelCount'],
        })
        : [];
    const smartFunctionDemandMap = new Map((smartFunctionRows || []).map((row) => {
        const plain = row.toJSON ? row.toJSON() : row;
        return [plain.id, plain];
    }));

    const requirements = aggregateRequirements(levels, smartFunctionDemandMap);
    const {
        products: allocatedProducts,
        unmetRequirements,
        allocationDiagnostics,
    } = await allocateProducts(requirements, compatibleProductIds, selectedRangeId, selectedColorId, language);
    const allocatedServices = await calculateServices({ levels, selectedServiceIds, language }, allocatedProducts, selectedServiceIds);

    const { ProductRange, Color } = (await import('../../models/index.js')).default;
    const rangeRow = selectedRangeId ? await ProductRange.findByPk(selectedRangeId) : null;
    const colorRow = selectedColorId ? await Color.findByPk(selectedColorId) : null;
    const rangeMultiplier = Math.max(0.01, Math.min(100, safeNum(rangeRow?.priceMultiplier, 1.0)));

    const relatedProducts = await buildRelatedProducts(allocatedProducts, { selectedRangeId, selectedColorId, language });
    const calculatedProducts = buildCalculatedProducts(allocatedProducts, { rangeMultiplier, multiplicationIndex });
    const calculatedRelatedProducts = buildCalculatedProducts(relatedProducts, { rangeMultiplier, multiplicationIndex });
    const calculatedServices = buildCalculatedServices(allocatedServices, { multiplicationIndex });
    const totals = await calculateTotals([...calculatedProducts, ...calculatedRelatedProducts], calculatedServices, multiplicationIndex);

    const hasAnyReq =
        (requirements?.room && Object.keys(requirements.room).some(k => Object.values(requirements.room[k] || {}).some(v => safeNum(v) > 0))) ||
        (requirements?.level && Object.keys(requirements.level).some(k => Object.values(requirements.level[k] || {}).some(v => safeNum(v) > 0))) ||
        (requirements?.project && Object.keys(requirements.project).some(k => Object.values(requirements.project[k] || {}).some(v => safeNum(v) > 0)));
    const noCompatibleProducts = Boolean(
        (hasAnyReq && (!calculatedProducts || calculatedProducts.length === 0)) ||
        (Array.isArray(unmetRequirements) && unmetRequirements.length > 0)
    );

    return {
        products: calculatedProducts,
        relatedProducts: calculatedRelatedProducts,
        services: calculatedServices,
        ...totals,
        rangeName: rangeRow ? getLocalizedValue(rangeRow, 'name', language, rangeRow?.name ?? null) : null,
        colorName: colorRow ? getLocalizedValue(colorRow, 'name', language, colorRow?.name ?? null) : null,
        rangeMultiplier,
        projectMultiplier: multiplicationIndex,
        noCompatibleProducts: noCompatibleProducts || false,
        unmetRequirements: Array.isArray(unmetRequirements) ? unmetRequirements : [],
        unmetRequirementsCount: Array.isArray(unmetRequirements) ? unmetRequirements.length : 0,
        requirementsSummary: summarizeRequirements(requirements),
        allocationDiagnostics: Array.isArray(allocationDiagnostics) ? allocationDiagnostics : []
    };
};

function isValidUuid(value) {
    return value != null && typeof value === 'string' && UUID_REGEX.test(value.trim());
}

/**
 * Aggregates function counts; safe for missing rooms/functions.
 */
const aggregateRequirements = (levels, smartFunctionDemandMap = new Map()) => {
    const requirements = {
        room: {},
        level: {},
        project: { project: {} }
    };
    if (!Array.isArray(levels)) return requirements;

    levels.forEach(level => {
        const levelId = level?.id ?? level?.tempId ?? `level-${level?.name ?? 'unknown'}`;
        if (!requirements.level[levelId]) requirements.level[levelId] = {};
        const rooms = Array.isArray(level.rooms) ? level.rooms : [];
        rooms.forEach(room => {
            const roomId = room?.id ?? room?.tempId ?? `room-${room?.name ?? 'unknown'}`;
            if (!requirements.room[roomId]) requirements.room[roomId] = {};
            const roomSelections = Array.isArray(room.functionSelections) ? room.functionSelections : (Array.isArray(room.functions) ? room.functions : []);
            const roomCount = normalizeRoomCount(room.roomCount ?? room.count);
            roomSelections.forEach(f => {
                const funcId = f?.smartFunctionId ?? f?.id;
                if (!funcId) return;
                const qty = Math.max(0, safeNum(f.quantity, 1)) * roomCount;
                const demand = resolveFunctionDemand(smartFunctionDemandMap.get(funcId), f);
                if (demand.input > 0) {
                    requirements.room[roomId][funcId] = (requirements.room[roomId][funcId] || 0) + (qty * demand.input);
                }
                if (demand.output > 0) {
                    requirements.level[levelId][funcId] = (requirements.level[levelId][funcId] || 0) + (qty * demand.output);
                }
                if (demand.general > 0) {
                    requirements.project.project[funcId] = (requirements.project.project[funcId] || 0) + (qty * demand.general);
                }
            });
        });
    });
    return requirements;
};

/** Cache for join table/column detection (avoids repeated information_schema queries). */
let _rangeJoinInfo = null;
let _colorJoinInfo = null;

/**
 * Resolve ProductRangeProducts table and column names from DB.
 */
async function getRangeJoinInfo(sequelize) {
    if (_rangeJoinInfo) return _rangeJoinInfo;
    const [tables] = await sequelize.query(
        `SELECT table_schema, table_name FROM information_schema.tables
         WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
         AND LOWER(table_name) LIKE '%product%' AND LOWER(table_name) LIKE '%range%'
         ORDER BY table_schema, table_name LIMIT 5`
    );
    for (const t of tables || []) {
        const schema = t.table_schema || 'public';
        const tableName = t.table_name;
        const [cols] = await sequelize.query(
            `SELECT column_name FROM information_schema.columns
             WHERE table_schema = :schema AND table_name = :tableName ORDER BY ordinal_position`,
            { replacements: { schema, tableName } }
        );
        const colNames = (cols || []).map(c => c.column_name);
        const productCol = colNames.find(c => /product/.test(c) && !/range/.test(c));
        const rangeCol = colNames.find(c => /range/.test(c) || c === 'product_range_id' || c === 'productRangeId');
        if (productCol && rangeCol) {
            const q = (s) => (s !== s.toLowerCase() || s.includes('_') ? `"${s}"` : s);
            _rangeJoinInfo = {
                table: schema === 'public' ? (tableName !== tableName.toLowerCase() ? `"${tableName}"` : tableName) : `"${schema}"."${tableName}"`,
                productCol: q(productCol),
                rangeCol: q(rangeCol),
            };
            return _rangeJoinInfo;
        }
    }
    _rangeJoinInfo = { table: null, productCol: null, rangeCol: null };
    return _rangeJoinInfo;
}

/**
 * Resolve ProductColorProducts table and column names from DB.
 */
async function getColorJoinInfo(sequelize) {
    if (_colorJoinInfo) return _colorJoinInfo;
    const [tables] = await sequelize.query(
        `SELECT table_schema, table_name FROM information_schema.tables
         WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
         AND LOWER(table_name) LIKE '%product%' AND LOWER(table_name) LIKE '%color%'
         ORDER BY table_schema, table_name LIMIT 5`
    );
    for (const t of tables || []) {
        const schema = t.table_schema || 'public';
        const tableName = t.table_name;
        const [cols] = await sequelize.query(
            `SELECT column_name FROM information_schema.columns
             WHERE table_schema = :schema AND table_name = :tableName ORDER BY ordinal_position`,
            { replacements: { schema, tableName } }
        );
        const colNames = (cols || []).map(c => c.column_name);
        const productCol = colNames.find(c => /product/.test(c) && !/color/.test(c));
        const colorCol = colNames.find(c => /color/.test(c) || c === 'color_id' || c === 'colorId');
        if (productCol && colorCol) {
            const q = (s) => (s !== s.toLowerCase() || s.includes('_') ? `"${s}"` : s);
            _colorJoinInfo = {
                table: schema === 'public' ? (tableName !== tableName.toLowerCase() ? `"${tableName}"` : tableName) : `"${schema}"."${tableName}"`,
                productCol: q(productCol),
                colorCol: q(colorCol),
            };
            return _colorJoinInfo;
        }
    }
    _colorJoinInfo = { table: null, productCol: null, colorCol: null };
    return _colorJoinInfo;
}

/**
 * Filters products by range and color; only uses valid UUIDs.
 * Uses information_schema to detect join table/column names so any DB schema works.
 */
const getCompatibleProductIds = async (rangeId, colorId) => {
    const sequelize = ProductRangeProduct.sequelize;
    let productIds = null;
    const hasRangeFilter = Boolean(rangeId && isValidUuid(rangeId));
    const hasColorFilter = Boolean(colorId && isValidUuid(colorId));

    if (hasRangeFilter || hasColorFilter) {
        try {
            const models = (await import('../../models/index.js')).default;
            const include = [];

            if (hasRangeFilter) {
                include.push({
                    model: models.ProductRange,
                    as: 'productRanges',
                    attributes: [],
                    through: { attributes: [] },
                    where: { id: rangeId },
                    required: true,
                });
            }

            if (hasColorFilter) {
                include.push({
                    model: models.Color,
                    as: 'colors',
                    attributes: [],
                    through: { attributes: [] },
                    where: { id: colorId },
                    required: true,
                });
            }

            const rows = await Product.findAll({
                attributes: ['id'],
                include,
            });
            const ids = (rows || []).map((row) => row.id).filter(Boolean);
            if (ids.length > 0) {
                return ids;
            }
        } catch (_) {
            // Fall through to the legacy join-table lookup below.
        }
    }

    if (hasRangeFilter) {
        try {
            const rangeProducts = await ProductRangeProduct.findAll({ where: { productRangeId: rangeId } });
            productIds = rangeProducts.map(p => p.productId).filter(Boolean);
            if (productIds.length === 0) {
                const info = await getRangeJoinInfo(sequelize);
                if (info.table && info.productCol && info.rangeCol) {
                    const rows = await sequelize.query(
                        `SELECT ${info.productCol} AS "productId" FROM ${info.table} WHERE ${info.rangeCol} = :rangeId`,
                        { replacements: { rangeId }, type: sequelize.QueryTypes.SELECT }
                    ).catch(() => []);
                    if (rows?.length) productIds = rows.map(r => r.productId).filter(Boolean);
                }
                if (productIds.length === 0) {
                    for (const [tbl, pCol, rCol] of [
                        ['"ProductRangeProducts"', '"productId"', '"productRangeId"'],
                        ['"ProductRangeProducts"', 'product_id', 'product_range_id'],
                        ['productrangeproducts', 'product_id', 'product_range_id'],
                    ]) {
                        const rows = await sequelize.query(
                            `SELECT ${pCol} AS "productId" FROM ${tbl} WHERE ${rCol} = :rangeId`,
                            { replacements: { rangeId }, type: sequelize.QueryTypes.SELECT }
                        ).catch(() => []);
                        if (rows?.length) {
                            productIds = rows.map(r => r.productId).filter(Boolean);
                            break;
                        }
                    }
                }
            }
        } catch (_) {
            productIds = [];
        }
    }

    if (hasColorFilter) {
        try {
            let colorProductIds = [];
            const colorProducts = await ProductColorProduct.findAll({
                where: productIds?.length ? { colorId, productId: { [Op.in]: productIds } } : { colorId }
            });
            colorProductIds = colorProducts.map(p => p.productId).filter(Boolean);
            if (colorProductIds.length === 0) {
                const info = await getColorJoinInfo(sequelize);
                if (info.table && info.productCol && info.colorCol) {
                    const rows = await sequelize.query(
                        `SELECT ${info.productCol} AS "productId" FROM ${info.table} WHERE ${info.colorCol} = :colorId`,
                        { replacements: { colorId }, type: sequelize.QueryTypes.SELECT }
                    ).catch(() => []);
                    if (rows?.length) colorProductIds = rows.map(r => r.productId).filter(Boolean);
                }
                if (colorProductIds.length === 0) {
                    for (const [tbl, pCol, cCol] of [
                        ['"ProductColorProducts"', '"productId"', '"colorId"'],
                        ['"ProductColorProducts"', 'product_id', 'color_id'],
                        ['productcolorproducts', 'product_id', 'color_id'],
                    ]) {
                        const rows = await sequelize.query(
                            `SELECT ${pCol} AS "productId" FROM ${tbl} WHERE ${cCol} = :colorId`,
                            { replacements: { colorId }, type: sequelize.QueryTypes.SELECT }
                        ).catch(() => []);
                        if (rows?.length) {
                            colorProductIds = rows.map(r => r.productId).filter(Boolean);
                            break;
                        }
                    }
                }
            }
            productIds = productIds?.length
                ? productIds.filter(id => colorProductIds.includes(id))
                : colorProductIds;
        } catch (_) {
            productIds = productIds || [];
        }
    }

    if (hasRangeFilter || hasColorFilter) {
        return productIds || [];
    }
    return null;
};

const allocateProducts = async (requirements, compatibleProductIds, selectedRangeId, selectedColorId, language = 'en') => {
    // Fetch all active mappings
    const mappingOptions = {
        where: { isActive: true },
        include: [{ model: Product, as: 'product', where: { isActive: true, productType: 'STANDARD' }, required: true }]
    };
    if (Array.isArray(compatibleProductIds)) {
        if (compatibleProductIds.length === 0) {
            return {
                products: [],
                unmetRequirements: [],
                allocationDiagnostics: [],
            };
        }
        mappingOptions.where.productId = { [Op.in]: compatibleProductIds };
    }
    const allMappings = await ProductFunctionMapping.findAll(mappingOptions);

    const productCounts = {}; // productId -> quantity
    const unmet = []; // track missing mappings for actionable feedback
    const allocationDiagnostics = [];

    // Group mappings by SmartFunction
    const funcMappings = {};
    allMappings.forEach(m => {
        if (!funcMappings[m.smartFunctionId]) funcMappings[m.smartFunctionId] = [];
        funcMappings[m.smartFunctionId].push(m);
    });

    // Helper to add products to tally
    const addProduct = (productId, qty) => {
        if (!productId) return;
        productCounts[productId] = (productCounts[productId] || 0) + qty;
    };

    // Get range and color names for snapshot
    const { ProductRange, Color } = (await import('../../models/index.js')).default;
    const range = selectedRangeId ? await ProductRange.findByPk(selectedRangeId) : null;
    const color = selectedColorId ? await Color.findByPk(selectedColorId) : null;

    // channelType: IN = room-level, OUT = level-level, GENERAL = any. Respect scope + channelType.
    const channelAllowed = (m, scope) => {
        const ch = (m.channelType || 'GENERAL').toUpperCase();
        if (scope === 'room') return ch === 'IN' || ch === 'GENERAL';
        if (scope === 'level') return ch === 'OUT' || ch === 'GENERAL';
        return ch === 'GENERAL';
    };

    const sortCandidates = (arr) => (arr || []).slice().sort((a, b) => {
        // Client requirement: pick by largest channel capacity first, then by priority (deterministic).
        const ca = Math.max(1, safeNum(a.capacity, 1));
        const cb = Math.max(1, safeNum(b.capacity, 1));
        if (cb !== ca) return cb - ca;
        return safeNum(b.priority) - safeNum(a.priority);
    });

    const isBetterAllocation = (candidate, currentBest) => {
        if (!currentBest) return true;
        if (candidate.totalCost !== currentBest.totalCost) {
            return candidate.totalCost < currentBest.totalCost;
        }
        if (candidate.excess !== currentBest.excess) {
            return candidate.excess < currentBest.excess;
        }
        if (candidate.totalCount !== currentBest.totalCount) {
            return candidate.totalCount < currentBest.totalCount;
        }
        if (candidate.priorityScore !== currentBest.priorityScore) {
            return candidate.priorityScore > currentBest.priorityScore;
        }
        for (let i = 0; i < candidate.counts.length; i += 1) {
            if (candidate.counts[i] !== currentBest.counts[i]) {
                return candidate.counts[i] > currentBest.counts[i];
            }
        }
        return false;
    };

    const allocateGreedy = ({ needed, candidates }) => {
        const target = Math.max(0, Math.ceil(safeNum(needed)));
        const sorted = sortCandidates(candidates)
            .filter(m => m?.productId)
            .map((mapping) => ({
                ...(mapping?.toJSON ? mapping.toJSON() : mapping),
                capacity: Math.max(1, safeNum(mapping.capacity, 1)),
                unitPrice: Math.max(0, safeNum(mapping?.product?.unitPriceEurExVat ?? mapping?.product?.unitPrice, 0)),
                priority: safeNum(mapping.priority, 0),
            }));

        if (!sorted.length || target <= 0) return { remaining: target, allocated: 0 };

        const memo = new Map();

        const search = (index, remainingNeed) => {
            if (remainingNeed <= 0) {
                return {
                    counts: new Array(sorted.length - index).fill(0),
                    totalCost: 0,
                    excess: Math.abs(remainingNeed),
                    totalCount: 0,
                    priorityScore: 0,
                };
            }

            if (index >= sorted.length) return null;

            const key = `${index}|${remainingNeed}`;
            if (memo.has(key)) return memo.get(key);

            const current = sorted[index];
            const maxQty = Math.ceil(remainingNeed / current.capacity);
            let best = null;

            for (let qty = maxQty; qty >= 0; qty -= 1) {
                const child = search(index + 1, remainingNeed - (qty * current.capacity));
                if (!child) continue;

                const allocation = {
                    counts: [qty, ...child.counts],
                    totalCost: Number((qty * current.unitPrice) + child.totalCost),
                    excess: child.excess,
                    totalCount: qty + child.totalCount,
                    priorityScore: (qty * current.priority) + child.priorityScore,
                };

                if (isBetterAllocation(allocation, best)) {
                    best = allocation;
                }
            }

            memo.set(key, best);
            return best;
        };

        const best = search(0, target);

        if (!best) {
            return { remaining: target, allocated: 0 };
        }

        best.counts.forEach((qty, idx) => {
            if (qty > 0) {
                addProduct(sorted[idx].productId, qty);
            }
        });

        return { remaining: 0, allocated: best.totalCount };
    };

    const requiredFunctionIds = new Set();
    ['room', 'level', 'project'].forEach((scope) => {
        const scopeData = requirements[scope] || {};
        Object.values(scopeData).forEach((entityReqs) => {
            Object.keys(entityReqs || {}).forEach((funcId) => requiredFunctionIds.add(funcId));
        });
    });

    for (const funcId of requiredFunctionIds) {
        const mappingsForFunc = funcMappings[funcId] || [];

        const scopeGroups = {
            room: mappingsForFunc.filter(m => m.calculationScope === 'room' && channelAllowed(m, 'room')),
            level: mappingsForFunc.filter(m => m.calculationScope === 'level' && channelAllowed(m, 'level')),
            project: mappingsForFunc.filter(m => m.calculationScope === 'project' && channelAllowed(m, 'project'))
        };
        const scopesWithRequirements = ['room', 'level', 'project'].filter((scope) => {
            const scopeData = requirements[scope] || {};
            return Object.values(scopeData).some((entityReqs) => safeNum(entityReqs?.[funcId]) > 0);
        });
        const scopesToEvaluate = Array.from(new Set([
            ...scopesWithRequirements,
            ...['room', 'level', 'project'].filter((scope) => scopeGroups[scope].length > 0)
        ]));

        for (const scope of scopesToEvaluate) {
            const scopeMappings = scopeGroups[scope];
            const scopeData = requirements[scope] || {};
            for (const entityId of Object.keys(scopeData)) {
                const entityReqs = scopeData[entityId];
                if (!entityReqs || typeof entityReqs !== 'object') continue;
                const needed = Math.max(0, safeNum(entityReqs[funcId]));
                if (needed <= 0) continue;

                if (!scopeMappings || scopeMappings.length === 0) {
                    unmet.push({ funcId, scope, entityId, needed });
                    allocationDiagnostics.push({ smartFunctionId: funcId, scope, entityId, requiredQuantity: needed, candidateMappings: 0, allocated: 0, remaining: needed });
                    continue;
                }
                const out = allocateGreedy({ needed, candidates: scopeMappings });
                allocationDiagnostics.push({ smartFunctionId: funcId, scope, entityId, requiredQuantity: needed, candidateMappings: scopeMappings.length, allocated: out.allocated, remaining: out.remaining });
                if (out.remaining > 0) unmet.push({ funcId, scope, entityId, needed });
            }
        }
    }

    const result = [];
    const productIds = Object.keys(productCounts);
    const productRecords = productIds.length
        ? await Product.findAll({ where: { id: { [Op.in]: productIds } } })
        : [];
    const productsById = new Map((productRecords || []).map((product) => [product.id, product]));

    for (const productId of productIds) {
        const product = productsById.get(productId);
        if (!product) continue;
        const po = serializeLocalizedEntity(product, { language, fields: ['name', 'description'] });
        const quantity = Math.max(0, safeNum(productCounts[productId]));
        const unitPrice = safeNum(po.unitPriceEurExVat);
        result.push({
            productId,
            code: po.code || 'N/A',
            name: po.name || 'Product',
            description: po.description || '',
            imageUrl: po.imageUrl || null,
            unitPrice,
            quantity,
            subtotal: Number((quantity * unitPrice).toFixed(2)),
            rangeName: range ? getLocalizedValue(range, 'name', language, range?.name ?? 'N/A') : 'N/A',
            colorName: color ? getLocalizedValue(color, 'name', language, color?.name ?? 'N/A') : 'N/A'
        });
    }

    return {
        products: result,
        unmetRequirements: unmet.map((entry) => ({
            smartFunctionId: entry.funcId,
            scope: entry.scope,
            entityId: entry.entityId,
            requiredQuantity: Math.max(0, safeNum(entry.needed)),
        })),
        allocationDiagnostics,
    };
};

async function buildRelatedProducts(products, { selectedRangeId, selectedColorId, language }) {
    const standardProducts = Array.isArray(products) ? products : [];
    const mainProductIds = standardProducts.map((product) => product.productId).filter(Boolean);
    if (mainProductIds.length === 0) return [];

    const dependencies = await ProductDependency.findAll({
        where: { mainProductId: { [Op.in]: mainProductIds } },
        include: [{
            model: Product,
            as: 'relatedProduct',
            where: { isActive: true, productType: 'RELATED' },
            required: true
        }]
    });
    if (!dependencies.length) return [];

    const mainQuantity = new Map(standardProducts.map((product) => [product.productId, Math.max(0, safeNum(product.quantity))]));
    const { ProductRange, Color } = (await import('../../models/index.js')).default;
    const range = selectedRangeId ? await ProductRange.findByPk(selectedRangeId) : null;
    const color = selectedColorId ? await Color.findByPk(selectedColorId) : null;
    const aggregate = new Map();

    dependencies.forEach((dependency) => {
        const row = dependency?.toJSON ? dependency.toJSON() : dependency;
        const related = row?.relatedProduct;
        if (!related?.id) return;
        const quantity = mainQuantity.get(row.mainProductId) || 0;
        const requiredQuantity = quantity * Math.max(0, safeNum(row.quantityPerMainProduct, 1));
        if (requiredQuantity <= 0) return;
        const current = aggregate.get(related.id) || { product: related, quantity: 0, sources: [] };
        current.quantity += requiredQuantity;
        current.sources.push({ mainProductId: row.mainProductId, quantityPerMainProduct: row.quantityPerMainProduct });
        aggregate.set(related.id, current);
    });

    return Array.from(aggregate.entries()).map(([productId, item]) => {
        const po = serializeLocalizedEntity(item.product, { language, fields: ['name', 'description'] });
        const quantity = Math.max(0, safeNum(item.quantity));
        const unitPrice = safeNum(po.unitPriceEurExVat);
        return {
            productId,
            code: po.code || 'N/A',
            name: po.name || 'Related Product',
            description: po.description || '',
            imageUrl: po.imageUrl || null,
            unitPrice,
            quantity,
            subtotal: Number((quantity * unitPrice).toFixed(2)),
            rangeName: range ? getLocalizedValue(range, 'name', language, range?.name ?? 'N/A') : 'N/A',
            colorName: color ? getLocalizedValue(color, 'name', language, color?.name ?? 'N/A') : 'N/A',
            lineType: 'RELATED',
            isSystemCalculated: true,
            dependencySources: item.sources
        };
    });
}
const calculateServices = async (projectData, products, selectedServiceIds) => {
    const language = normalizeBusinessLanguage(projectData?.language);
    const SmartFunction = (await import('../../models/SmartFunction.js')).default;
    const allServices = await Service.findAll({
        where: { isActive: true },
        include: [{ model: SmartFunction, as: 'smartFunctions' }]
    });
    const levels = Array.isArray(projectData?.levels) ? projectData.levels : [];
    const projectFunctionIds = new Set();
    levels.forEach(l => {
        (Array.isArray(l.rooms) ? l.rooms : []).forEach(r => {
            const selections = Array.isArray(r.functionSelections) ? r.functionSelections : (Array.isArray(r.functions) ? r.functions : []);
            selections.forEach(s => {
                const functionId = s?.smartFunctionId ?? s?.id;
                if (isValidUuid(functionId)) projectFunctionIds.add(String(functionId).trim());
            });
        });
    });

    const result = [];
    const productQtySum = (Array.isArray(products) ? products : []).reduce((acc, p) => acc + safeNum(p?.quantity), 0);
    let totalFunctionQty = 0;
    levels.forEach(l => {
        (Array.isArray(l.rooms) ? l.rooms : []).forEach(r => {
            const selections = Array.isArray(r.functionSelections) ? r.functionSelections : (Array.isArray(r.functions) ? r.functions : []);
            const roomCount = normalizeRoomCount(r.roomCount ?? r.count);
            selections.forEach(s => totalFunctionQty += safeNum(s?.quantity, 1) * roomCount);
        });
    });
    const roomsCount = levels.reduce((acc, l) => acc + (Array.isArray(l.rooms) ? l.rooms.length : 0), 0);

    for (const service of allServices) {
        const isSelected = Array.isArray(selectedServiceIds) && selectedServiceIds.includes(service.id);
        const isMandatory = service.isOptionalForCustomer === false;
        const smartFns = service.smartFunctions;
        const isMapped = !Array.isArray(smartFns) || smartFns.length === 0 || smartFns.some(sf => sf?.id && projectFunctionIds.has(sf.id));

        if (!((isSelected || isMandatory) && isMapped)) continue;

        let qty = 1;
        switch (String(service.pricingMode || 'fixed_project')) {
            case 'per_room': qty = Math.max(0, roomsCount); break;
            case 'per_level': qty = Math.max(0, levels.length); break;
            case 'per_product_qty': qty = Math.max(0, productQtySum); break;
            case 'per_function_qty': qty = Math.max(0, totalFunctionQty); break;
            default: qty = 1;
        }
        const unitPrice = safeNum(service.unitPriceEurExVat);
        result.push({
            serviceId: service.id,
            serviceCode: service.code || service.id,
            name: getLocalizedValue(service, 'name', language, service.name || 'Service'),
            description: getLocalizedValue(service, 'description', language, service.description || ''),
            pricingMode: service.pricingMode || 'fixed_project',
            calcQty: qty,
            unitPrice,
            subtotal: Number((qty * unitPrice).toFixed(2))
        });
    }
    return result;
};

const calculateTotals = async (products, services, multiplicationIndex) => {
    const mult = Math.max(0.01, Math.min(100, safeNum(multiplicationIndex, 1.0)));
    const productsSubtotalPerProject = roundMoney((Array.isArray(products) ? products : []).reduce((acc, p) => acc + safeNum(p?.subtotal), 0));
    const servicesSubtotalPerProject = roundMoney((Array.isArray(services) ? services : []).reduce((acc, s) => acc + safeNum(s?.subtotal), 0));
    const totalPerProject = roundMoney(productsSubtotalPerProject + servicesSubtotalPerProject);
    const productsSubtotal = roundMoney(productsSubtotalPerProject * mult);
    const servicesSubtotal = roundMoney(servicesSubtotalPerProject * mult);
    const grossTotal = roundMoney(productsSubtotal + servicesSubtotal);

    const rules = await DiscountRule.findAll({
        where: {
            minMultiplier: { [Op.lte]: mult },
            maxMultiplier: { [Op.gte]: mult },
            isActive: true
        },
        order: [['discountPercent', 'DESC']]
    });
    const rule = rules && rules.length > 0 ? rules[0] : null;
    const discountPercent = rule ? safeNum(rule.discountPercent) : 0;
    const discountAmount = roundMoney(grossTotal * (discountPercent / 100));
    const grandTotal = roundMoney(Math.max(0, grossTotal - discountAmount));

    return {
        productsSubtotalPerProject,
        servicesSubtotalPerProject,
        totalPerProject,
        productsSubtotal,
        servicesSubtotal,
        grossTotal,
        discountPercent,
        discountAmount,
        grandTotal
    };
};



