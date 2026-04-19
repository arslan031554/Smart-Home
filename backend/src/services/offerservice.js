import Offer from '../../models/Offer.js';
import OfferProduct from '../../models/OfferProduct.js';
import OfferService from '../../models/OfferService.js';
import OfferFollowup from '../../models/OfferFollowup.js';
import Project from '../../models/Project.js';
import BuildingType from '../../models/BuildingType.js';
import Product from '../../models/Product.js';
import Service from '../../models/Service.js';
import User from '../../models/User.js';
import { randomBytes } from 'crypto';
import * as calculationService from './calculationservice.js';
import * as followupService from './followupservice.js';
import sequelize from '../config/database.js';
import { isValidOfferStatus, normalizeOfferStatus } from '../constants/offerStatus.js';
import { getLocalizedValue, normalizeBusinessLanguage } from '../utils/localization.js';

function normalizePositiveNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeString(value, fallback = '') {
    return typeof value === 'string' ? value : fallback;
}

function buildOfferReferenceCandidate(date = new Date()) {
    const pad = (value) => String(value).padStart(2, '0');
    const datePart = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
    const timePart = `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
    const randomPart = randomBytes(2).toString('hex').toUpperCase();
    return `OFF-${datePart}-${timePart}-${randomPart}`;
}

async function generateUniqueOfferNumber(transaction = null) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
        const offerNumber = buildOfferReferenceCandidate();
        const existing = await Offer.findOne({
            where: { offerNumber },
            attributes: ['id'],
            transaction,
        });
        if (!existing) return offerNumber;
    }

    return `OFF-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function normalizeProjectInfo(projectInfo = {}, project = null, levels = [], language = 'en') {
    return {
        name: normalizeString(projectInfo.name, project?.name || ''),
        buildingType: projectInfo.buildingType || project?.buildingTypeId || project?.buildingType?.id || '',
        buildingTypeName: normalizeString(projectInfo.buildingTypeName, project?.buildingType ? getLocalizedValue(project.buildingType, 'name', language, project?.buildingType?.name || '') : ''),
        buildingTypeDescription: normalizeString(projectInfo.buildingTypeDescription, project?.buildingType ? getLocalizedValue(project.buildingType, 'description', language, project?.buildingType?.description || '') : ''),
        levelsCount: Math.max(1, parseInt((projectInfo.levelsCount ?? project?.levelsCount ?? levels.length ?? 1), 10) || 1),
        area: projectInfo.area ?? project?.builtUpArea ?? '',
        description: normalizeString(projectInfo.description, project?.description || ''),
        projectComplexity: normalizeString(projectInfo.projectComplexity, project?.projectComplexity || ''),
        projectMultiplicationIndex: Math.max(1, parseInt((projectInfo.projectMultiplicationIndex ?? project?.multiplicationIndex ?? 1), 10) || 1),
        clientType: normalizeString(projectInfo.clientType, 'private'),
        companyName: normalizeString(projectInfo.companyName, ''),
    };
}

function buildStoredCalculationBreakdown(offerData = {}, calculation = null, project = null) {
    const projectMultiplier = Math.max(
        1,
        parseInt(
            offerData?.projectInfo?.projectMultiplicationIndex ??
            offerData?.multiplicationIndex ??
            project?.multiplicationIndex ??
            1,
            10,
        ) || 1,
    );

    const productsSubtotal = normalizePositiveNumber(calculation?.productsSubtotal);
    const servicesSubtotal = normalizePositiveNumber(calculation?.servicesSubtotal);
    const grossTotal = normalizePositiveNumber(calculation?.grossTotal, productsSubtotal + servicesSubtotal);

    return {
        projectMultiplier,
        rangeMultiplier: normalizePositiveNumber(calculation?.rangeMultiplier, 1),
        productsSubtotalPerProject: normalizePositiveNumber(calculation?.productsSubtotalPerProject, projectMultiplier > 0 ? productsSubtotal / projectMultiplier : productsSubtotal),
        servicesSubtotalPerProject: normalizePositiveNumber(calculation?.servicesSubtotalPerProject, projectMultiplier > 0 ? servicesSubtotal / projectMultiplier : servicesSubtotal),
        totalPerProject: normalizePositiveNumber(calculation?.totalPerProject, projectMultiplier > 0 ? grossTotal / projectMultiplier : grossTotal),
        productsSubtotal,
        servicesSubtotal,
        grossTotal,
        discountPercent: normalizePositiveNumber(calculation?.discountPercent),
        discountAmount: normalizePositiveNumber(calculation?.discountAmount),
        grandTotal: normalizePositiveNumber(calculation?.grandTotal),
    };
}

function buildStoredCalculationSnapshot(offerData = {}, project = null, calculation = null) {
    const language = normalizeBusinessLanguage(offerData.language);
    const levels = Array.isArray(offerData.levels) ? offerData.levels : [];
    const selectedServiceIds = Array.isArray(offerData.selectedServiceIds)
        ? offerData.selectedServiceIds
        : Array.isArray(offerData.serviceIds)
            ? offerData.serviceIds
            : Array.isArray(offerData.services)
                ? offerData.services
                : [];
    const selectedRangeId = offerData.selectedRangeId ?? offerData.rangeId ?? offerData.range ?? null;
    const selectedColorId = offerData.selectedColorId ?? offerData.colorId ?? offerData.color ?? null;
    const projectInfo = normalizeProjectInfo(offerData.projectInfo || {}, project, levels, language);

    return {
        levels,
        projectInfo,
        selectedRangeId,
        selectedColorId,
        rangeId: selectedRangeId,
        colorId: selectedColorId,
        selectedServiceIds,
        serviceIds: selectedServiceIds,
        services: selectedServiceIds,
        multiplicationIndex: projectInfo.projectMultiplicationIndex,
        customerComments: offerData.customerComments || null,
        language,
        calculationBreakdown: buildStoredCalculationBreakdown(offerData, calculation, project),
        status: offerData.status || undefined,
    };
}

function buildOfferProductsPayload(offerId, products = []) {
    return products.map((product) => ({
        offerId,
        productId: product.productId,
        productCode: product.code,
        productName: product.name,
        productDescription: product.description,
        rangeName: product.rangeName,
        colorName: product.colorName,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        subtotal: product.subtotal,
    }));
}

function buildOfferServicesPayload(offerId, services = []) {
    return services.map((service) => ({
        offerId,
        serviceId: service.serviceId,
        serviceName: service.name,
        pricingMode: service.pricingMode,
        calcQty: service.calcQty,
        unitPrice: service.unitPrice,
        subtotal: service.subtotal,
    }));
}

async function replaceOfferLineItems(offerId, calculation, transaction) {
    await OfferProduct.destroy({ where: { offerId }, transaction });
    await OfferService.destroy({ where: { offerId }, transaction });

    const offerProducts = buildOfferProductsPayload(offerId, calculation.products || []);
    if (offerProducts.length) {
        await OfferProduct.bulkCreate(offerProducts, { transaction });
    }

    const offerServices = buildOfferServicesPayload(offerId, calculation.services || []);
    if (offerServices.length) {
        await OfferService.bulkCreate(offerServices, { transaction });
    }
}

function toOfferListItem(o) {
    const oo = o?.toJSON ? o.toJSON() : o;
    const levels = oo?.calculationSnapshot?.levels || [];
    const projectInfo = oo?.calculationSnapshot?.projectInfo || {};
    const roomsCount = Array.isArray(levels)
        ? levels.reduce((acc, level) => acc + ((level?.rooms && Array.isArray(level.rooms)) ? level.rooms.length : 0), 0)
        : 0;
    const functionsCount = Array.isArray(levels)
        ? levels.reduce((acc, level) => acc + ((level?.rooms && Array.isArray(level.rooms)) ? level.rooms.reduce((roomAcc, room) => {
            const selections = room?.functionSelections || room?.functions || [];
            if (!Array.isArray(selections)) return roomAcc;
            return roomAcc + selections.filter((selection) => (selection?.quantity ?? 0) > 0).length;
        }, 0) : 0), 0)
        : 0;

    const follow = oo?.followup || oo?.followUp || null;
    return {
        id: oo.id,
        offerNumber: oo.offerNumber,
        status: oo.status,
        createdAt: oo.createdAt,
        updatedAt: oo.updatedAt,
        projectId: oo.projectId,
        projectName: oo.project?.name || projectInfo.name || oo.projectName || null,
        buildingType: oo.project?.buildingType?.name || projectInfo.buildingTypeName || oo.buildingType || null,
        customerName: oo.project?.user?.fullName || oo.customerName || null,
        customerEmail: oo.project?.user?.email || oo.customerEmail || null,
        totalAmount: oo.grandTotal ?? oo.totalAmount ?? 0,
        roomsCount,
        functionsCount,
        followUp: follow ? {
            enabled: !!follow.enabled,
            status: follow.status || 'pending',
            nextReminderAt: follow.nextReminderAt || null,
            reason: follow.reason || null,
            channels: { email: !!follow.channelEmail, sms: !!follow.channelSms },
        } : { enabled: false },
    };
}

async function getProjectContext(projectId, transaction) {
    return Project.findByPk(projectId, {
        transaction,
        include: [
            { model: User, as: 'user', attributes: ['id', 'email', 'fullName', 'phone'] },
            { model: BuildingType, as: 'buildingType' },
        ],
    });
}
function createAccessError() {
    const error = new Error('Offer not found');
    error.statusCode = 404;
    return error;
}

function assertOfferAccess(offer, actor) {
    if (!offer) throw createAccessError();
    if (!actor) return;
    if (actor.role === 'admin' || actor.role === 'employee') return;
    if (offer.project?.user?.id !== actor.id) throw createAccessError();
}

async function enrichOfferLineItems(offer) {
    if (!offer) return offer;

    const language = normalizeBusinessLanguage(offer?.calculationSnapshot?.language);
    const productIds = (Array.isArray(offer.products) ? offer.products : []).map((item) => item?.productId).filter(Boolean);
    const serviceIds = (Array.isArray(offer.services) ? offer.services : []).map((item) => item?.serviceId).filter(Boolean);

    if (!productIds.length && !serviceIds.length) return offer;

    const [products, services] = await Promise.all([
        productIds.length
            ? Product.findAll({ where: { id: productIds }, attributes: ['id', 'name', 'description', 'translations', 'imageUrl'] })
            : Promise.resolve([]),
        serviceIds.length
            ? Service.findAll({ where: { id: serviceIds }, attributes: ['id', 'code', 'name', 'description', 'translations'] })
            : Promise.resolve([]),
    ]);

    const productMap = new Map((products || []).map((item) => {
        const plain = item.toJSON ? item.toJSON() : item;
        return [plain.id, plain];
    }));
    const serviceMap = new Map((services || []).map((item) => {
        const plain = item.toJSON ? item.toJSON() : item;
        return [plain.id, plain];
    }));

    (Array.isArray(offer.products) ? offer.products : []).forEach((item) => {
        const product = productMap.get(item?.productId);
        const imageUrl = product?.imageUrl || null;
        if (item?.setDataValue) {
            item.setDataValue('imageUrl', imageUrl);
        } else if (item) {
            item.imageUrl = imageUrl;
        }

        if (product?.description && !String(item?.productDescription || '').trim()) {
            const description = getLocalizedValue(product, 'description', language, product.description || '');
            if (item?.setDataValue) {
                item.setDataValue('productDescription', description);
            } else if (item) {
                item.productDescription = description;
            }
        }
    });

    (Array.isArray(offer.services) ? offer.services : []).forEach((item) => {
        const service = serviceMap.get(item?.serviceId);
        const description = service ? getLocalizedValue(service, 'description', language, service.description || '') : '';
        const code = service?.code || null;

        if (item?.setDataValue) {
            item.setDataValue('description', description);
            item.setDataValue('serviceCode', code);
        } else if (item) {
            item.description = description;
            item.serviceCode = code;
        }
    });

    return offer;
}

async function assertProjectAccess(projectId, actor, transaction) {
    if (!actor || actor.role === 'admin' || actor.role === 'employee') return;
    const project = await Project.findByPk(projectId, {
        attributes: ['id', 'userId'],
        transaction,
    });
    if (!project || project.userId !== actor.id) throw createAccessError();
}

export const createOffer = async (projectId, offerData, actor = null) => {
    const calculation = await calculationService.calculateOffer(offerData);
    const transaction = await sequelize.transaction();

    try {
        await assertProjectAccess(projectId, actor, transaction);
        const project = await getProjectContext(projectId, transaction);
        const snapshot = buildStoredCalculationSnapshot(offerData, project, calculation);
        const offerNumber = await generateUniqueOfferNumber(transaction);
        const desiredStatus = isValidOfferStatus(offerData?.status) ? normalizeOfferStatus(offerData.status) : 'offer_ready';

        const offer = await Offer.create({
            projectId,
            offerNumber,
            status: desiredStatus,
            customerComments: snapshot.customerComments,
            productsSubtotal: calculation.productsSubtotal,
            servicesSubtotal: calculation.servicesSubtotal,
            discountPercent: calculation.discountPercent,
            discountAmount: calculation.discountAmount,
            grandTotal: calculation.grandTotal,
            calculationSnapshot: snapshot,
        }, { transaction });

        await replaceOfferLineItems(offer.id, calculation, transaction);
        await followupService.syncOfferFollowup(offer.id, desiredStatus, transaction);

        await transaction.commit();
        return await getOfferById(offer.id, actor);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const updateOfferFromConfig = async (id, offerData, actor = null) => {
    const existing = await Offer.findByPk(id, {
        include: [
            { model: Project, as: 'project', include: [{ model: BuildingType, as: 'buildingType' }, { model: User, as: 'user', attributes: ['id', 'email', 'fullName', 'phone'] }] },
        ],
    });
    assertOfferAccess(existing, actor);

    const calculation = await calculationService.calculateOffer(offerData);
    const transaction = await sequelize.transaction();

    try {
        const desiredStatus = isValidOfferStatus(offerData?.status) ? normalizeOfferStatus(offerData.status) : 'offer_ready';
        const snapshot = buildStoredCalculationSnapshot(offerData, existing.project || null, calculation);

        await existing.update({
            status: desiredStatus,
            customerComments: snapshot.customerComments,
            productsSubtotal: calculation.productsSubtotal,
            servicesSubtotal: calculation.servicesSubtotal,
            discountPercent: calculation.discountPercent,
            discountAmount: calculation.discountAmount,
            grandTotal: calculation.grandTotal,
            calculationSnapshot: snapshot,
        }, { transaction });

        await replaceOfferLineItems(existing.id, calculation, transaction);
        await followupService.syncOfferFollowup(existing.id, desiredStatus, transaction);

        await transaction.commit();
        return await getOfferById(existing.id, actor);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getOfferById = async (id, actor = null) => {
    const offer = await Offer.findByPk(id, {
        include: [
            { model: OfferProduct, as: 'products' },
            { model: OfferService, as: 'services' },
            { model: OfferFollowup, as: 'followup' },
            {
                model: Project,
                as: 'project',
                include: [
                    { model: User, as: 'user', attributes: ['id', 'email', 'fullName', 'phone'] },
                    { model: BuildingType, as: 'buildingType' },
                ],
            },
        ],
    });
    assertOfferAccess(offer, actor);
    await enrichOfferLineItems(offer);
    return offer;
};

export const listOffers = async (projectId = null, userId = null) => {
    const where = {};
    if (projectId) where.projectId = projectId;

    const include = [{ model: OfferFollowup, as: 'followup' }];
    const projectInclude = {
        model: Project,
        as: 'project',
        attributes: ['id', 'name', 'description', 'levelsCount', 'multiplicationIndex', 'builtUpArea', 'projectComplexity'],
        include: [
            { model: User, as: 'user', attributes: ['id', 'email', 'fullName', 'phone'] },
            { model: BuildingType, as: 'buildingType' },
        ],
        required: !!userId || !!projectId,
    };

    if (userId) {
        projectInclude.where = { ...(projectId ? { id: projectId } : {}), userId };
    } else if (projectId) {
        projectInclude.where = { id: projectId };
    }

    include.push(projectInclude);

    const offers = await Offer.findAll({
        where: Object.keys(where).length ? where : undefined,
        include,
        order: [['createdAt', 'DESC']],
    });

    return offers.map(toOfferListItem);
};

export const updateOfferStatus = async (id, status, actor = null) => {
    const offer = await Offer.findByPk(id, {
        include: [
            { model: OfferFollowup, as: 'followup' },
            {
                model: Project,
                as: 'project',
                include: [
                    { model: User, as: 'user', attributes: ['id', 'email', 'fullName', 'phone'] },
                    { model: BuildingType, as: 'buildingType' },
                ],
            },
        ],
    });
    assertOfferAccess(offer, actor);

    const nextStatus = normalizeOfferStatus(status);
    if (!isValidOfferStatus(nextStatus)) {
        const err = new Error('Invalid status');
        err.statusCode = 400;
        throw err;
    }

    await offer.update({ status: nextStatus });
    await followupService.syncOfferFollowup(offer.id, nextStatus);
    const refreshed = await getOfferById(offer.id, actor);
    return toOfferListItem(refreshed);
};
export const duplicateOffer = async (id, actor = null) => {
    const original = await getOfferById(id, actor);
    if (!original) throw createAccessError();

    const originalPlain = original.toJSON ? original.toJSON() : original;
    const transaction = await sequelize.transaction();

    try {
        const snapshot = buildStoredCalculationSnapshot({
            ...(originalPlain.calculationSnapshot || {}),
            customerComments: originalPlain.customerComments,
            selectedServiceIds: originalPlain.calculationSnapshot?.selectedServiceIds || (originalPlain.services || []).map((service) => service.serviceId).filter(Boolean),
        }, originalPlain.project || null, {
            ...originalPlain.calculationSnapshot?.calculationBreakdown,
            productsSubtotal: normalizePositiveNumber(originalPlain.productsSubtotal),
            servicesSubtotal: normalizePositiveNumber(originalPlain.servicesSubtotal),
            grossTotal: normalizePositiveNumber(originalPlain.productsSubtotal) + normalizePositiveNumber(originalPlain.servicesSubtotal),
            discountPercent: normalizePositiveNumber(originalPlain.discountPercent),
            discountAmount: normalizePositiveNumber(originalPlain.discountAmount),
            grandTotal: normalizePositiveNumber(originalPlain.grandTotal),
        });
        const offerNumber = await generateUniqueOfferNumber(transaction);

        const newOffer = await Offer.create({
            projectId: originalPlain.projectId,
            offerNumber,
            status: 'draft',
            customerComments: originalPlain.customerComments,
            productsSubtotal: normalizePositiveNumber(originalPlain.productsSubtotal),
            servicesSubtotal: normalizePositiveNumber(originalPlain.servicesSubtotal),
            discountPercent: normalizePositiveNumber(originalPlain.discountPercent),
            discountAmount: normalizePositiveNumber(originalPlain.discountAmount),
            grandTotal: normalizePositiveNumber(originalPlain.grandTotal),
            calculationSnapshot: snapshot,
        }, { transaction });

        const products = (originalPlain.products || []).map((product) => {
            const data = { ...product };
            delete data.id;
            delete data.createdAt;
            delete data.updatedAt;
            data.offerId = newOffer.id;
            return data;
        });
        if (products.length) {
            await OfferProduct.bulkCreate(products, { transaction });
        }

        const services = (originalPlain.services || []).map((service) => {
            const data = { ...service };
            delete data.id;
            delete data.createdAt;
            delete data.updatedAt;
            data.offerId = newOffer.id;
            return data;
        });
        if (services.length) {
            await OfferService.bulkCreate(services, { transaction });
        }

        await followupService.syncOfferFollowup(newOffer.id, newOffer.status, transaction);

        await transaction.commit();
        return await getOfferById(newOffer.id, actor);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const deleteOffer = async (id, actor = null) => {
    const offer = await getOfferById(id, actor);

    await offer.destroy();
    return { id };
};





