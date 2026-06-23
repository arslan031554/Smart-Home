import models from '../../models/index.js';
import sequelize from '../config/database.js';
import { serializeProductForApi } from '../serializers/productserializer.js';
import { serializeRoomTypeForApi } from '../serializers/roomtypeserializer.js';
import { serializeSmartFunctionForApi } from '../serializers/smartfunctionserializer.js';
import { serializeServiceForApi } from '../serializers/serviceserializer.js';
import { normalizeTranslations } from '../utils/localization.js';
import bcrypt from 'bcryptjs';
import { Op, fn, col } from 'sequelize';
import { normalizeOfferStatus } from '../constants/offerStatus.js';
import { getDefaultPermissionsForEmployeeRole, normalizePermissions } from '../constants/adminpermissions.js';

const { RoomType, BuildingType, ProductRange, Color, ProductFunctionMapping, SmartFunction, Service, User, Offer } = models;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Include options for models that have relations needed in list/detail */
function getDefaultIncludes(modelName) {
    if (modelName === 'SmartFunction') {
        return [{ model: RoomType, as: 'roomTypes', attributes: ['id', 'name'], through: { attributes: [] } }];
    }
    if (modelName === 'RoomType') {
        return [{ model: BuildingType, as: 'buildingTypes', attributes: ['id', 'name'], through: { attributes: [] } }];
    }
    if (modelName === 'Product') {
        return [
            { model: ProductRange, as: 'productRanges', attributes: ['id', 'name'], through: { attributes: [] } },
            { model: Color, as: 'colors', attributes: ['id', 'name'], through: { attributes: [] } },
            { model: ProductFunctionMapping, as: 'mappings', include: [{ model: SmartFunction, as: 'smartFunction', attributes: ['id', 'name', 'code'] }] }
        ];
    }
    if (modelName === 'Service') {
        return [{ model: SmartFunction, as: 'smartFunctions', attributes: ['id', 'name'], through: { attributes: [] } }];
    }
    return [];
}

/**
 * Generic CRUD Service for Admin
 */
export const getAll = async (modelName, options = {}) => {
    const includes = getDefaultIncludes(modelName);
    const opts = includes.length
        ? { ...options, include: options.include || includes }
        : options;
    const rows = await models[modelName].findAll(opts);
    if (modelName === 'Product') return rows.map((row) => serializeProductForApi(row));
    if (modelName === 'RoomType') return rows.map((row) => serializeRoomTypeForApi(row));
    if (modelName === 'SmartFunction') return rows.map((row) => serializeSmartFunctionForApi(row));
    if (modelName === 'Service') return rows.map((row) => serializeServiceForApi(row));
    return rows;
};

export const getById = async (modelName, id, options = {}) => {
    const includes = getDefaultIncludes(modelName);
    const opts = includes.length
        ? { ...options, include: options.include || includes }
        : options;
    const row = await models[modelName].findByPk(id, opts);
    if (modelName === 'Product' && row) return serializeProductForApi(row);
    if (modelName === 'RoomType' && row) return serializeRoomTypeForApi(row);
    if (modelName === 'SmartFunction' && row) return serializeSmartFunctionForApi(row);
    if (modelName === 'Service' && row) return serializeServiceForApi(row);
    return row;
};

function parsePositivePriceOrThrow(raw) {
    if (raw === null || raw === undefined || raw === '') {
        throw new Error('Price is required and must be greater than 0');
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error('Price must be a number greater than 0');
    }
    return n;
}

function normalizeProductPriceForWrite(d, { requirePrice }) {
    const hasPriceKey = Object.prototype.hasOwnProperty.call(d, 'price');
    const hasUnitKey = Object.prototype.hasOwnProperty.call(d, 'unitPriceEurExVat');
    if (!hasPriceKey && !hasUnitKey) {
        if (requirePrice) throw new Error('Price is required and must be greater than 0');
        return;
    }
    if (hasPriceKey) {
        d.unitPriceEurExVat = parsePositivePriceOrThrow(d.price);
        delete d.price;
        return;
    }
    d.unitPriceEurExVat = parsePositivePriceOrThrow(d.unitPriceEurExVat);
}

function applyFlatTranslationFields(d) {
    const translations = normalizeTranslations(d.translations);
    const localizedFields = ['name', 'description', 'text'];

    for (const field of localizedFields) {
        for (const language of ['en', 'ro']) {
            const key = `${field}${language.charAt(0).toUpperCase()}${language.slice(1)}`;
            if (!Object.prototype.hasOwnProperty.call(d, key)) continue;

            const rawValue = d[key];
            const normalizedValue = typeof rawValue === 'string' ? rawValue.trim() : '';
            if (!translations[field]) translations[field] = {};

            if (normalizedValue) {
                translations[field][language] = normalizedValue;
            } else {
                delete translations[field][language];
                if (Object.keys(translations[field]).length === 0) { delete translations[field]; }
            }

            delete d[key];
        }
    }

    if (Object.keys(translations).length > 0) {
        d.translations = translations;
    } else if (Object.prototype.hasOwnProperty.call(d, 'translations')) {
        d.translations = {};
    }
}
const normalizePayload = (modelName, data) => {
    const d = { ...data };
    if (Object.prototype.hasOwnProperty.call(d, 'translations')) {
        d.translations = normalizeTranslations(d.translations);
    }
    applyFlatTranslationFields(d);
    if (modelName === 'Service') {
        if (d.price !== undefined) { d.unitPriceEurExVat = Number(d.price); delete d.price; }
        if (d.type !== undefined) { d.pricingMode = d.type; delete d.type; }
        delete d.smartFunctions;
        if (!d.code && d.name) {
            d.code = d.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toUpperCase().slice(0, 32) || `SVC-${Date.now()}`;
        }
    }
    if (modelName === 'Product') {
        if (d.image !== undefined) { d.imageUrl = d.image; delete d.image; }
        if (d.status !== undefined) { d.isActive = d.status === 'Active'; delete d.status; }
        delete d.allowedRanges;
        delete d.allowedColors;
        delete d.mappings;
    }
    if (modelName === 'SmartFunction') {
        delete d.roomTypes;
    }
    if (modelName === 'RoomType') {
        delete d.buildingTypes;
    }
    return d;
};

function throwValidation(message, errors = null) {
    const err = new Error(message || 'Validation failed');
    err.code = 'VALIDATION_ERROR';
    err.statusCode = 400;
    if (errors) err.errors = errors;
    return err;
}

function normalizeUniqueUuidArray(raw, fieldName) {
    if (raw === null) return [];
    if (raw === undefined) return null;
    if (!Array.isArray(raw)) throw throwValidation('Validation failed', { [fieldName]: `${fieldName} must be an array` });

    const out = [];
    const seen = new Set();
    for (let i = 0; i < raw.length; i++) {
        const v = raw[i];
        if (v === null || v === undefined) continue;
        const s = String(v).trim();
        if (!s) continue;
        if (!UUID_REGEX.test(s)) {
            throw throwValidation('Validation failed', { [fieldName]: `Invalid ID at index ${i}` });
        }
        if (seen.has(s)) continue;
        seen.add(s);
        out.push(s);
    }
    return out;
}

async function assertIdsExist({ model, ids, fieldName, transaction }) {
    if (!ids || ids.length === 0) return;
    const rows = await model.findAll({ where: { id: ids }, attributes: ['id'], transaction });
    const found = new Set((rows || []).map(r => (r?.id ?? (r?.toJSON ? r.toJSON().id : null))).filter(Boolean));
    const missing = ids.filter(id => !found.has(id));
    if (missing.length) {
        throw throwValidation('Validation failed', { [fieldName]: `Invalid selection: ${missing.join(', ')}` });
    }
}

function normalizeAndDedupeProductMappings(rawMappings) {
    const mappings = Array.isArray(rawMappings) ? rawMappings : [];
    const normalized = [];

    const seenExact = new Set();
    const seenByFuncScopeChannel = new Map();

    for (let i = 0; i < mappings.length; i++) {
        const m = mappings[i];
        if (!m || typeof m !== 'object') continue;

        const smartFunctionId = m.smartFunctionId || m.functionId;
        if (!smartFunctionId) throw throwValidation(`Invalid mapping at index ${i}: functionId is required`);

        const channelType = String(m.channelType || 'GENERAL').toUpperCase();
        if (!['IN', 'OUT', 'GENERAL'].includes(channelType)) {
            throw throwValidation(`Invalid mapping at index ${i}: channelType must be IN, OUT, or GENERAL`);
        }

        const calculationScope = String(m.calculationScope || 'room');
        if (!['room', 'level', 'project'].includes(calculationScope)) {
            throw throwValidation(`Invalid mapping at index ${i}: calculationScope must be room, level, or project`);
        }

        const capacityRaw = m.capacity;
        const capacity = Math.max(1, parseInt(capacityRaw, 10) || 1);
        const priorityRaw = m.priority;
        const priority = parseInt(priorityRaw, 10);
        const priorityVal = Number.isFinite(priority) ? priority : 0;

        const isActive = m.isActive === undefined ? true : Boolean(m.isActive);

        const exactKey = [
            smartFunctionId,
            channelType,
            calculationScope,
            capacity,
            priorityVal,
            isActive ? 1 : 0
        ].join('|');

        if (seenExact.has(exactKey)) continue;
        seenExact.add(exactKey);

        const funcKey = `${smartFunctionId}|${channelType}|${calculationScope}`;
        const sig = `${capacity}|${priorityVal}|${isActive ? 1 : 0}`;
        const existingSig = seenByFuncScopeChannel.get(funcKey);
        if (existingSig && existingSig !== sig) {
            throw throwValidation(
                `Duplicate/conflicting mappings detected for functionId ${smartFunctionId} (${channelType}, ${calculationScope}). ` +
                `Please keep only one mapping per function/channel/scope.`
            );
        }
        seenByFuncScopeChannel.set(funcKey, sig);

        normalized.push({
            smartFunctionId,
            channelType,
            capacity,
            priority: priorityVal,
            calculationScope,
            isActive
        });
    }

    return normalized;
}

async function fetchProductForResponse(productId, transaction) {
    const row = await models.Product.findByPk(productId, {
        include: getDefaultIncludes('Product'),
        transaction
    });
    if (!row) throw new Error('Product not found');
    return serializeProductForApi(row);
}

export const create = async (modelName, data) => {
    if (modelName === 'Product') {
        return await createProductFull(data);
    }
    const roomTypeIds = modelName === 'SmartFunction' ? (data.roomTypes || []) : null;
    const buildingTypeIds = modelName === 'RoomType' ? (data.buildingTypes || []) : null;
    const serviceFunctionIds = modelName === 'Service' ? (data.smartFunctions || []) : null;
    if (modelName === 'Service' && Array.isArray(serviceFunctionIds)) {
        await assertIdsExist({ model: SmartFunction, ids: serviceFunctionIds, fieldName: 'smartFunctions' });
    }
    const record = await models[modelName].create(normalizePayload(modelName, data));
    if (modelName === 'SmartFunction' && Array.isArray(roomTypeIds)) {
        await record.setRoomTypes(roomTypeIds);
    }
    if (modelName === 'RoomType' && Array.isArray(buildingTypeIds)) {
        await record.setBuildingTypes(buildingTypeIds);
    }
    if (modelName === 'Service' && Array.isArray(serviceFunctionIds)) {
        await record.setSmartFunctions(serviceFunctionIds);
    }
    if (modelName === 'SmartFunction' || modelName === 'RoomType' || modelName === 'Service') {
        const row = await models[modelName].findByPk(record.id, { include: getDefaultIncludes(modelName) });
        if (modelName === 'RoomType') return serializeRoomTypeForApi(row);
        if (modelName === 'SmartFunction') return serializeSmartFunctionForApi(row);
        if (modelName === 'Service') return serializeServiceForApi(row);
        return row;
    }
    return record;
};

export const update = async (modelName, id, data) => {
    if (modelName === 'Product') {
        return await updateProductFull(id, data);
    }
    const roomTypeIds = modelName === 'SmartFunction' ? (data.roomTypes || []) : null;
    const buildingTypeIds = modelName === 'RoomType' ? (data.buildingTypes || []) : null;
    const serviceFunctionIds = modelName === 'Service' && Object.prototype.hasOwnProperty.call(data, 'smartFunctions')
        ? (data.smartFunctions || [])
        : null;
    if (modelName === 'Service' && serviceFunctionIds !== null) {
        await assertIdsExist({ model: SmartFunction, ids: serviceFunctionIds, fieldName: 'smartFunctions' });
    }
    const record = await models[modelName].findByPk(id);
    if (!record) throw new Error(`${modelName} not found`);
    await record.update(normalizePayload(modelName, data));
    if (modelName === 'SmartFunction') {
        await record.setRoomTypes(Array.isArray(roomTypeIds) ? roomTypeIds : []);
    }
    if (modelName === 'RoomType' && buildingTypeIds !== null) {
        await record.setBuildingTypes(Array.isArray(buildingTypeIds) ? buildingTypeIds : []);
    }
    if (modelName === 'Service' && serviceFunctionIds !== null) {
        await record.setSmartFunctions(Array.isArray(serviceFunctionIds) ? serviceFunctionIds : []);
    }
    if (modelName === 'SmartFunction' || modelName === 'RoomType' || modelName === 'Service') {
        const row = await models[modelName].findByPk(id, { include: getDefaultIncludes(modelName) });
        if (modelName === 'RoomType') return serializeRoomTypeForApi(row);
        if (modelName === 'SmartFunction') return serializeSmartFunctionForApi(row);
        if (modelName === 'Service') return serializeServiceForApi(row);
        return row;
    }
    return record;
};

export const remove = async (modelName, id) => {
    const record = await models[modelName].findByPk(id);
    if (!record) throw new Error(`${modelName} not found`);
    return await record.destroy();
};

async function createProductFull(data) {
    const rangeIdsRaw = Array.isArray(data.rangeIds) ? data.rangeIds : (data.allowedRanges ?? []);
    const colorIdsRaw = Array.isArray(data.colorIds) ? data.colorIds : (data.allowedColors ?? []);
    const rangeIds = normalizeUniqueUuidArray(rangeIdsRaw, 'allowedRanges') || [];
    const colorIds = normalizeUniqueUuidArray(colorIdsRaw, 'allowedColors') || [];
    const mappings = normalizeAndDedupeProductMappings(data.mappings);
    const t = await sequelize.transaction();
    try {
        const core = normalizePayload('Product', data);
        normalizeProductPriceForWrite(core, { requirePrice: true });
        const product = await models.Product.create(core, { transaction: t });

        await assertIdsExist({ model: ProductRange, ids: rangeIds, fieldName: 'allowedRanges', transaction: t });
        await assertIdsExist({ model: Color, ids: colorIds, fieldName: 'allowedColors', transaction: t });

        const smartFunctionIds = mappings.map(m => m.smartFunctionId);
        await assertIdsExist({ model: SmartFunction, ids: smartFunctionIds, fieldName: 'mappings', transaction: t });

        await product.setProductRanges(rangeIds, { transaction: t });
        await product.setColors(colorIds, { transaction: t });
        for (const m of mappings) {
            await ProductFunctionMapping.create({
                productId: product.id,
                smartFunctionId: m.smartFunctionId,
                channelType: m.channelType,
                capacity: m.capacity,
                priority: m.priority,
                calculationScope: m.calculationScope,
                isActive: m.isActive
            }, { transaction: t });
        }
        const responseProduct = await fetchProductForResponse(product.id, t);
        await t.commit();
        return responseProduct;
    } catch (err) {
        await t.rollback();
        try {
            const payload = {
                code: data?.code,
                name: data?.name,
                allowedRangesCount: Array.isArray(data?.allowedRanges) ? data.allowedRanges.length : null,
                allowedColorsCount: Array.isArray(data?.allowedColors) ? data.allowedColors.length : null,
                mappingsCount: Array.isArray(data?.mappings) ? data.mappings.length : null,
                mappings: Array.isArray(data?.mappings)
                    ? data.mappings.slice(0, 5).map((m) => ({
                        functionId: m?.functionId ?? m?.smartFunctionId ?? null,
                        channelType: m?.channelType ?? null,
                        capacity: m?.capacity ?? null,
                        priority: m?.priority ?? null,
                        calculationScope: m?.calculationScope ?? null,
                    }))
                    : null
            };
            console.error('[admin/products] createProductFull failed', {
                errName: err?.name,
                errMessage: err?.message,
                statusCode: err?.statusCode ?? null,
                parentCode: err?.parent?.code ?? null,
                parentDetail: err?.parent?.detail ?? null,
                payload
            });
        } catch (logErr) {
            console.error('[admin/products] createProductFull logging failed', logErr?.message || logErr);
        }
        throw err;
    }
}

async function updateProductFull(id, data) {
    const rangeIdsRaw = Array.isArray(data.rangeIds) ? data.rangeIds : data.allowedRanges;
    const colorIdsRaw = Array.isArray(data.colorIds) ? data.colorIds : data.allowedColors;
    const rangeIds = normalizeUniqueUuidArray(rangeIdsRaw, 'allowedRanges');
    const colorIds = normalizeUniqueUuidArray(colorIdsRaw, 'allowedColors');
    const mappings = data.mappings !== undefined ? normalizeAndDedupeProductMappings(data.mappings) : null;
    const t = await sequelize.transaction();
    try {
        const product = await models.Product.findByPk(id, { transaction: t });
        if (!product) throw new Error('Product not found');
        const core = normalizePayload('Product', data);
        normalizeProductPriceForWrite(core, { requirePrice: false });
        await product.update(core, { transaction: t });

        if (rangeIds !== null) {
            await assertIdsExist({ model: ProductRange, ids: rangeIds, fieldName: 'allowedRanges', transaction: t });
            await product.setProductRanges(rangeIds, { transaction: t });
        }
        if (colorIds !== null) {
            await assertIdsExist({ model: Color, ids: colorIds, fieldName: 'allowedColors', transaction: t });
            await product.setColors(colorIds, { transaction: t });
        }

        if (mappings !== null) {
            const smartFunctionIds = mappings.map(m => m.smartFunctionId);
            await assertIdsExist({ model: SmartFunction, ids: smartFunctionIds, fieldName: 'mappings', transaction: t });

            await ProductFunctionMapping.destroy({ where: { productId: id }, transaction: t });
            for (const m of mappings) {
                await ProductFunctionMapping.create({
                    productId: id,
                    smartFunctionId: m.smartFunctionId,
                    channelType: m.channelType,
                    capacity: m.capacity,
                    priority: m.priority,
                    calculationScope: m.calculationScope,
                    isActive: m.isActive
                }, { transaction: t });
            }
        }
        const responseProduct = await fetchProductForResponse(id, t);
        await t.commit();
        return responseProduct;
    } catch (err) {
        await t.rollback();
        throw err;
    }
}

export const syncRelations = async (modelName, id, otherModelIds, relationField) => {
    const record = await models[modelName].findByPk(id);
    if (!record) throw new Error(`${modelName} not found`);
    
    const methodName = `set${relationField}`;
    if (typeof record[methodName] === 'function') {
        await record[methodName](otherModelIds);
    } else {
        throw new Error(`Relation method ${methodName} not found on ${modelName}`);
    }
    return record;
};

function serializeEmployee(user) {
    if (!user) return null;
    const plain = user.toJSON ? user.toJSON() : user;
    return {
        id: plain.id,
        name: plain.fullName || '',
        email: plain.email,
        role: plain.employeeRole || 'Engineer',
        permissions: normalizePermissions(plain.permissions),
        isActive: plain.isActive !== false,
        status: plain.isActive === false ? 'Suspended' : 'Active',
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
    };
}

function serializeAdminUser(user) {
    if (!user) return null;
    const plain = user.toJSON ? user.toJSON() : user;
    return {
        id: plain.id,
        fullName: plain.fullName || '',
        email: plain.email || '',
        phone: plain.phone || '',
        role: plain.role || 'customer',
        employeeRole: plain.employeeRole || null,
        companyName: plain.companyName || '',
        isActive: plain.isActive !== false,
        isVerified: plain.isVerified === true,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
    };
}

export async function getUsers() {
    const users = await User.findAll({
        attributes: [
            'id',
            'email',
            'fullName',
            'phone',
            'role',
            'employeeRole',
            'companyName',
            'isActive',
            'isVerified',
            'createdAt',
            'updatedAt',
        ],
        order: [['createdAt', 'DESC']],
    });

    return users.map(serializeAdminUser);
}

export async function getUserById(id) {
    const user = await User.findByPk(id, {
        attributes: [
            'id',
            'email',
            'fullName',
            'phone',
            'role',
            'employeeRole',
            'companyName',
            'invoiceName',
            'invoiceVat',
            'invoiceAddress',
            'isActive',
            'isVerified',
            'createdAt',
            'updatedAt',
        ],
    });

    if (!user) return null;
    const plain = user.toJSON ? user.toJSON() : user;
    return {
        ...serializeAdminUser(plain),
        invoiceName: plain.invoiceName || '',
        invoiceVat: plain.invoiceVat || '',
        invoiceAddress: plain.invoiceAddress || '',
    };
}

export async function getEmployees() {
    const employees = await User.findAll({
        where: { role: 'employee' },
        attributes: ['id', 'email', 'fullName', 'employeeRole', 'permissions', 'isActive', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'DESC']],
    });

    return employees.map(serializeEmployee);
}

export async function getEmployeeById(id) {
    const employee = await User.findOne({
        where: { id, role: 'employee' },
        attributes: ['id', 'email', 'fullName', 'employeeRole', 'permissions', 'isActive', 'createdAt', 'updatedAt'],
    });

    return serializeEmployee(employee);
}

export async function createEmployee(data = {}) {
    const existing = await User.findOne({ where: { email: String(data.email).trim().toLowerCase() } });
    if (existing) {
        const err = new Error('Employee email already exists');
        err.statusCode = 400;
        throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(String(data.password), salt);
    const employeeRole = data.role || 'Engineer';
    const permissions = Array.isArray(data.permissions) && data.permissions.length
        ? normalizePermissions(data.permissions)
        : getDefaultPermissionsForEmployeeRole(employeeRole);

    const employee = await User.create({
        email: String(data.email).trim().toLowerCase(),
        passwordHash,
        role: 'employee',
        fullName: String(data.name || '').trim(),
        employeeRole,
        permissions,
        isActive: data.isActive !== false,
        isVerified: true,
        termsAccepted: true,
        cookiesAccepted: true,
    });

    return serializeEmployee(employee);
}

export async function updateEmployee(id, data = {}) {
    const employee = await User.findOne({ where: { id, role: 'employee' } });
    if (!employee) throw new Error('Employee not found');

    if (data.email && String(data.email).trim().toLowerCase() !== employee.email) {
        const existing = await User.findOne({
            where: {
                email: String(data.email).trim().toLowerCase(),
                id: { [Op.ne]: id },
            },
        });
        if (existing) {
            const err = new Error('Employee email already exists');
            err.statusCode = 400;
            throw err;
        }
        employee.email = String(data.email).trim().toLowerCase();
    }

    if (data.name !== undefined) employee.fullName = String(data.name || '').trim();
    if (data.role !== undefined) employee.employeeRole = String(data.role || '').trim() || employee.employeeRole;
    if (data.isActive !== undefined) employee.isActive = Boolean(data.isActive);
    if (data.permissions !== undefined) employee.permissions = normalizePermissions(data.permissions);

    if (data.password) {
        const salt = await bcrypt.genSalt(10);
        employee.passwordHash = await bcrypt.hash(String(data.password), salt);
    }

    await employee.save();
    return serializeEmployee(employee);
}

export async function deleteEmployee(id) {
    const employee = await User.findOne({ where: { id, role: 'employee' } });
    if (!employee) throw new Error('Employee not found');
    await employee.destroy();
    return { id };
}

export async function getAdminStats() {
    const [
        totalOffers,
        revenueResult,
        activeEmployees,
        offersByStatusRows,
        totalCustomers,
    ] = await Promise.all([
        Offer.count(),
        Offer.findOne({
            attributes: [[fn('COALESCE', fn('SUM', col('grandTotal')), 0), 'totalRevenue']],
            raw: true,
        }),
        User.count({
            where: {
                role: { [Op.in]: ['admin', 'employee'] },
                isActive: true,
            },
        }),
        Offer.findAll({
            attributes: ['status', [fn('COUNT', col('id')), 'count']],
            group: ['status'],
            raw: true,
        }),
        User.count({ where: { role: 'customer' } }),
    ]);

    const offersByStatus = offersByStatusRows.reduce((acc, row) => {
        const status = normalizeOfferStatus(row.status || 'draft');
        acc[status] = (acc[status] || 0) + (Number(row.count) || 0);
        return acc;
    }, {});
    const pendingReview = offersByStatus.offer_generated || 0;

    return {
        totalOffers,
        pendingReview,
        totalRevenue: Number(revenueResult?.totalRevenue || 0),
        activeEmployees,
        totalCustomers,
        offersByStatus,
    };
}



