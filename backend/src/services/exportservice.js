import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import * as offerService from './offerservice.js';
import * as followupService from './followupservice.js';
import models from '../../models/index.js';
import { getLocalizedFlatValue, getLocalizedValue, normalizeBusinessLanguage, serializeLocalizedEntity } from '../utils/localization.js';
import { getOfferStatusLabel, normalizeOfferStatus } from '../constants/offerStatus.js';
import { generateBrandedPdf } from './pdfexportservice.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRAND = {
    name: process.env.APP_BRAND_NAME || 'Smart Building Configurator',
    currency: process.env.APP_CURRENCY || 'EUR',
    locale: process.env.APP_LOCALE || 'en-GB',
};

const MIME_TYPES = {
    pdf: 'application/pdf',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const FILE_EXTENSIONS = {
    pdf: 'pdf',
    excel: 'xlsx',
};

const OFFER_FILE_COLUMN_BY_TYPE = {
    pdf: { id: 'pdfFileId', path: 'pdfFilePath' },
    excel: { id: 'excelFileId', path: 'excelFilePath' },
};

const safeNum = (v, def = 0) => (v != null && !Number.isNaN(Number(v)) ? Number(v) : def);
const offerDate = (offer) => (offer.generatedAt ? new Date(offer.generatedAt) : new Date(offer.createdAt || Date.now()));

function getStorageRoot() {
    const configured = process.env.OFFER_FILE_STORAGE_PATH || path.join(__dirname, '..', '..', 'storage', 'offer-files');
    return path.resolve(configured);
}

function normalizeRelativeStoragePath(storagePath) {
    return String(storagePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function resolveStoredPath(storagePath) {
    const storageRoot = getStorageRoot();
    const absolutePath = path.resolve(storageRoot, normalizeRelativeStoragePath(storagePath));
    const relative = path.relative(storageRoot, absolutePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        const error = new Error('Invalid stored file path');
        error.statusCode = 400;
        throw error;
    }
    return absolutePath;
}

function createExportError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function assertExcelExportAccess(actor, offer = null) {
    if (!actor) {
        throw createExportError('Authentication required to export Excel', 401);
    }
    if (actor.role === 'admin') return;
    const offerPlain = offer?.toJSON ? offer.toJSON() : offer;
    const isOwner = offerPlain && (
        offerPlain.userId === actor.id ||
        offerPlain.project?.userId === actor.id ||
        offerPlain.project?.user?.id === actor.id
    );
    if (!isOwner) {
        throw createExportError('Excel exports are available to project owners and admins only', 403);
    }
}

function sanitizeFilenamePart(value, fallback = 'offer') {
    return String(value || fallback)
        .trim()
        .replace(/[^a-z0-9._-]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || fallback;
}

function buildGeneratedFilename(offer, fileType, lang = null) {
    const offerNumber = sanitizeFilenamePart(offer?.offerNumber || offer?.id);
    const effectiveLang = normalizeBusinessLanguage(lang || offer?.calculationSnapshot?.language);
    const suffix = fileType === 'pdf' ? 'Client-Offer' : 'Internal-Export';
    return `${offerNumber}-${suffix}-${effectiveLang}.${FILE_EXTENSIONS[fileType]}`;
}

function buildDownloadUrl(offerId, fileType) {
    return `/api/offers/${offerId}/export/${fileType === 'excel' ? 'excel' : 'pdf'}`;
}

function getOfferLanguage(offer) {
    return normalizeBusinessLanguage(offer?.calculationSnapshot?.language);
}

function getOfferFinancialBreakdown(offer) {
    const snapshot = offer?.calculationSnapshot || {};
    const stored = snapshot.calculationBreakdown || {};
    const multiplier = Math.max(
        1,
        parseInt(
            stored.projectMultiplier ??
            snapshot.projectInfo?.projectMultiplicationIndex ??
            offer?.project?.multiplicationIndex ??
            1,
            10,
        ) || 1,
    );
    const productsSubtotal = safeNum(offer?.productsSubtotal);
    const servicesSubtotal = safeNum(offer?.servicesSubtotal);
    const grossTotal = safeNum(stored.grossTotal, productsSubtotal + servicesSubtotal);

    return {
        projectMultiplier: multiplier,
        productsSubtotalPerProject: safeNum(stored.productsSubtotalPerProject, multiplier > 0 ? productsSubtotal / multiplier : productsSubtotal),
        servicesSubtotalPerProject: safeNum(stored.servicesSubtotalPerProject, multiplier > 0 ? servicesSubtotal / multiplier : servicesSubtotal),
        totalPerProject: safeNum(stored.totalPerProject, multiplier > 0 ? grossTotal / multiplier : grossTotal),
        productsSubtotal: safeNum(stored.productsSubtotal, productsSubtotal),
        servicesSubtotal: safeNum(stored.servicesSubtotal, servicesSubtotal),
        grossTotal: safeNum(stored.grossTotal, grossTotal),
        discountPercent: safeNum(stored.discountPercent, offer?.discountPercent),
        discountAmount: safeNum(stored.discountAmount, offer?.discountAmount),
        grandTotal: safeNum(stored.grandTotal, offer?.grandTotal),
    };
}

function t(lang, key) {
    const dict = {
        en: {
            offerSheet: 'Offer',
            offerTitle: 'Offer',
            date: 'Date',
            status: 'Status',
            customer: 'Customer',
            email: 'Email',
            project: 'Project',
            buildingType: 'Building Type',
            multiplier: 'Multiplication Index',
            projectStructure: 'PROJECT STRUCTURE & FUNCTIONS',
            level: 'Level',
            room: 'Room',
            function: 'Function',
            quantity: 'Quantity',
            itemizedProducts: 'ITEMIZED PRODUCTS',
            relatedProducts: 'Related Products',
            standardProduct: 'Standard Product',
            relatedProduct: 'Related Product',
            code: 'Code',
            name: 'Name',
            description: 'Description',
            range: 'Range',
            color: 'Color',
            unitPrice: 'Unit Price',
            subtotal: 'Subtotal',
            servicesInstall: 'SERVICES & INSTALLATION',
            serviceName: 'Service Name',
            pricingMode: 'Pricing Mode',
            financialSummary: 'FINANCIAL SUMMARY',
            productsTotal: 'Products Total',
            productsTotalPerProject: 'Products Total Per Project',
            servicesTotal: 'Services Total',
            servicesTotalPerProject: 'Services Total Per Project',
            discountPct: 'Discount (%)',
            discountAmount: 'Discount Amount',
            grossTotal: 'Gross Total',
            grandTotal: 'GRAND TOTAL',
            officialQuotation: 'Official Quotation / Proposal',
            offerNumber: 'Offer Number',
            projectName: 'Project Name',
            selectedFunctions: 'FUNCTIONS',
            productSpec: 'Product / Specification',
            price: 'Price',
            offerConditions: 'OFFER CONDITIONS',
            disclaimer: 'DISCLAIMER',
            customerComments: 'CUSTOMER COMMENTS',
            projectChapter: 'PROJECT',
            productsChapter: 'PRODUCTS',
            servicesChapter: 'SERVICES',
            grandTotalChapter: 'GRAND TOTAL',
            projectComplexity: 'Project Complexity',
            builtUpArea: 'Built-up Area',
            levels: 'Levels',
            buildingDescription: 'Building Description',
            projectNotes: 'Project Notes',
            noConfiguredFunctions: 'No configured functions',
            noProducts: 'No products',
            noServices: 'No services',
            noCustomerComments: 'No customer comments',
            totalPerProject: 'Total Per Project',
            baseTotal: 'Base Total',
        },
        ro: {
            offerSheet: 'Oferta',
            offerTitle: 'Oferta',
            date: 'Data',
            status: 'Status',
            customer: 'Client',
            email: 'Email',
            project: 'Proiect',
            buildingType: 'Tip cladire',
            multiplier: 'Index multiplicare',
            projectStructure: 'STRUCTURA PROIECT SI FUNCTII',
            level: 'Nivel',
            room: 'Camera',
            function: 'Functie',
            quantity: 'Cantitate',
            itemizedProducts: 'LISTA PRODUSE',
            relatedProducts: 'Produse conexe',
            standardProduct: 'Produs standard',
            relatedProduct: 'Produs conex',
            code: 'Cod',
            name: 'Denumire',
            description: 'Descriere',
            range: 'Gama',
            color: 'Culoare',
            unitPrice: 'Pret unitar',
            subtotal: 'Subtotal',
            servicesInstall: 'SERVICII SI INSTALARE',
            serviceName: 'Serviciu',
            pricingMode: 'Mod tarifare',
            financialSummary: 'REZUMAT FINANCIAR',
            productsTotal: 'Total produse',
            productsTotalPerProject: 'Total produse per proiect',
            servicesTotal: 'Total servicii',
            servicesTotalPerProject: 'Total servicii per proiect',
            discountPct: 'Discount (%)',
            discountAmount: 'Valoare discount',
            grossTotal: 'Total brut',
            grandTotal: 'TOTAL GENERAL',
            officialQuotation: 'Oferta / Propunere oficiala',
            offerNumber: 'Numar oferta',
            projectName: 'Nume proiect',
            selectedFunctions: 'FUNCTII',
            productSpec: 'Produs / Specificatie',
            price: 'Pret',
            offerConditions: 'CONDITII OFERTA',
            disclaimer: 'DISCLAIMER',
            customerComments: 'COMENTARII CLIENT',
            projectChapter: 'PROIECT',
            productsChapter: 'PRODUSE',
            servicesChapter: 'SERVICII',
            grandTotalChapter: 'TOTAL GENERAL',
            projectComplexity: 'Complexitate proiect',
            builtUpArea: 'Suprafata construita',
            levels: 'Niveluri',
            buildingDescription: 'Descriere cladire',
            projectNotes: 'Note proiect',
            noConfiguredFunctions: 'Nu exista functii configurate',
            noProducts: 'Nu exista produse',
            noServices: 'Nu exista servicii',
            noCustomerComments: 'Nu exista comentarii client',
            totalPerProject: 'Total per proiect',
            baseTotal: 'Total baza',
        },
    };

    return (dict[lang] && dict[lang][key]) ? dict[lang][key] : (dict.en[key] || key);
}

export const generateExcel = async (offerId, actor = null, requestedLang = null) => {
    const offer = await offerService.getOfferById(offerId, actor);
    if (!offer) throw new Error('Offer not found');
    const lang = normalizeBusinessLanguage(requestedLang || getOfferLanguage(offer));
    const financials = getOfferFinancialBreakdown(offer);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = BRAND.name;
    workbook.created = new Date();

    const products = Array.isArray(offer.products) ? offer.products : [];
    const services = Array.isArray(offer.services) ? offer.services : [];
    const levels = Array.isArray(offer?.calculationSnapshot?.levels) ? offer.calculationSnapshot.levels : [];
    const projectInfo = offer?.calculationSnapshot?.projectInfo || {};
    const projectName = getLocalizedFlatValue(
        projectInfo,
        'name',
        lang,
        getLocalizedFlatValue(offer.project || {}, 'name', lang, offer.project?.name || '-'),
    );
    const customerComments = getLocalizedFlatValue(
        {
            customerComments: offer?.calculationSnapshot?.customerComments ?? offer.customerComments,
            customerCommentsEn: offer?.calculationSnapshot?.customerCommentsEn,
            customerCommentsRo: offer?.calculationSnapshot?.customerCommentsRo,
        },
        'customerComments',
        lang,
        offer.customerComments || '-',
    );

    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } };
    const headerFont = { bold: true, color: { argb: 'FFFFFF' } };
    const currencyFmt = '#,##0.00';

    const projectSheet = workbook.addWorksheet('Project Info');
    projectSheet.columns = [
        { header: 'Field', key: 'field', width: 28 },
        { header: 'Value', key: 'value', width: 48 },
    ];
    projectSheet.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });
    const projectRows = [
        [t(lang, 'offerNumber'), offer.offerNumber],
        [t(lang, 'date'), offerDate(offer).toLocaleDateString(lang === 'ro' ? 'ro-RO' : BRAND.locale)],
        [t(lang, 'status'), getOfferStatusLabel(offer.status || 'draft')],
        [t(lang, 'customer'), offer.project?.user?.fullName || '-'],
        [t(lang, 'email'), offer.project?.user?.email || '-'],
        [t(lang, 'projectName'), projectName],
        [t(lang, 'buildingType'), projectInfo.buildingTypeName || offer.project?.buildingType?.name || '-'],
        [t(lang, 'levels'), projectInfo.levelsCount || offer.project?.levelsCount || levels.length || '-'],
        [t(lang, 'builtUpArea'), projectInfo.area || offer.project?.builtUpArea || '-'],
        [t(lang, 'projectComplexity'), projectInfo.projectComplexity || offer.project?.projectComplexity || '-'],
        [t(lang, 'multiplier'), financials.projectMultiplier],
        [t(lang, 'discountPct'), `${financials.discountPercent.toFixed(2)}%`],
        [t(lang, 'grandTotal'), financials.grandTotal],
        [t(lang, 'customerComments'), customerComments],
    ];
    projectRows.forEach((row) => projectSheet.addRow(row));
    projectSheet.getColumn(2).numFmt = currencyFmt;

    const productsSheet = workbook.addWorksheet('Products');
    productsSheet.columns = [
        { header: t(lang, 'code'), key: 'code', width: 18 },
        { header: 'Type', key: 'lineType', width: 18 },
        { header: t(lang, 'name'), key: 'name', width: 28 },
        { header: t(lang, 'description'), key: 'description', width: 38 },
        { header: t(lang, 'range'), key: 'range', width: 20 },
        { header: t(lang, 'color'), key: 'color', width: 20 },
        { header: 'Qty / Project', key: 'qtyProject', width: 14 },
        { header: 'Qty Total', key: 'qtyTotal', width: 12 },
        { header: `${t(lang, 'unitPrice')} (${BRAND.currency})`, key: 'unitPrice', width: 18 },
        { header: `${t(lang, 'subtotal')} / Project (${BRAND.currency})`, key: 'subtotalProject', width: 20 },
        { header: `${t(lang, 'subtotal')} / Total (${BRAND.currency})`, key: 'subtotalTotal', width: 20 },
    ];
    productsSheet.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });
    if (products.length) {
        products.forEach((p) => productsSheet.addRow({
            code: p.productCode ?? '',
            lineType: p.lineType === 'RELATED' ? t(lang, 'relatedProduct') : t(lang, 'standardProduct'),
            name: p.productName ?? '',
            description: p.productDescription ?? '',
            range: p.rangeName ?? 'N/A',
            color: p.colorName ?? 'N/A',
            qtyProject: safeNum(p.quantity),
            qtyTotal: safeNum(p.quantity) * financials.projectMultiplier,
            unitPrice: safeNum(p.unitPrice),
            subtotalProject: safeNum(p.subtotal),
            subtotalTotal: safeNum(p.subtotal) * financials.projectMultiplier,
        }));
    } else {
        productsSheet.addRow({ name: t(lang, 'noProducts') });
    }
    ['I', 'J', 'K'].forEach((col) => { productsSheet.getColumn(col).numFmt = currencyFmt; });

    const servicesSheet = workbook.addWorksheet('Services');
    servicesSheet.columns = [
        { header: t(lang, 'serviceName'), key: 'name', width: 28 },
        { header: t(lang, 'description'), key: 'description', width: 40 },
        { header: t(lang, 'pricingMode'), key: 'pricingMode', width: 20 },
        { header: 'Qty / Project', key: 'qtyProject', width: 14 },
        { header: 'Qty Total', key: 'qtyTotal', width: 12 },
        { header: `${t(lang, 'unitPrice')} (${BRAND.currency})`, key: 'unitPrice', width: 18 },
        { header: `${t(lang, 'subtotal')} / Project (${BRAND.currency})`, key: 'subtotalProject', width: 20 },
        { header: `${t(lang, 'subtotal')} / Total (${BRAND.currency})`, key: 'subtotalTotal', width: 20 },
    ];
    servicesSheet.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });
    if (services.length) {
        services.forEach((s) => servicesSheet.addRow({
            name: s.serviceName ?? '',
            description: s.description ?? '',
            pricingMode: s.pricingMode ?? '',
            qtyProject: safeNum(s.calcQty),
            qtyTotal: safeNum(s.calcQty) * financials.projectMultiplier,
            unitPrice: safeNum(s.unitPrice),
            subtotalProject: safeNum(s.subtotal),
            subtotalTotal: safeNum(s.subtotal) * financials.projectMultiplier,
        }));
    } else {
        servicesSheet.addRow({ name: t(lang, 'noServices') });
    }
    ['F', 'G', 'H'].forEach((col) => { servicesSheet.getColumn(col).numFmt = currencyFmt; });

    const summarySheet = workbook.addWorksheet('Calculation Summary');
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 32 },
        { header: 'Value', key: 'value', width: 22 },
    ];
    summarySheet.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });
    [
        [t(lang, 'productsTotalPerProject'), financials.productsSubtotalPerProject],
        [t(lang, 'servicesTotalPerProject'), financials.servicesSubtotalPerProject],
        [t(lang, 'totalPerProject'), financials.totalPerProject],
        [t(lang, 'multiplier'), financials.projectMultiplier],
        [t(lang, 'grossTotal'), financials.grossTotal],
        [t(lang, 'discountPct'), financials.discountPercent],
        [t(lang, 'discountAmount'), financials.discountAmount],
        [t(lang, 'grandTotal'), financials.grandTotal],
    ].forEach((row) => summarySheet.addRow(row));
    summarySheet.getColumn(2).numFmt = currencyFmt;

    return await workbook.xlsx.writeBuffer();
};

export const generatePdf = async (offerId, actor = null, requestedLang = null) => generateBrandedPdf(offerId, actor, requestedLang);

export const getStoredOfferFile = async (offerId, fileType, actor = null) => {
    if (!['pdf', 'excel'].includes(fileType)) {
        throw createExportError('Unsupported export file type', 400);
    }
    const offer = await offerService.getOfferById(offerId, actor);
    if (fileType === 'excel') assertExcelExportAccess(actor, offer);
    const offerPlain = offer?.toJSON ? offer.toJSON() : offer;
    const columns = OFFER_FILE_COLUMN_BY_TYPE[fileType];
    const currentFileId = offerPlain?.[columns.id] || null;

    if (!currentFileId) return null;
    const file = await models.OfferFile.findOne({
        where: {
            id: currentFileId,
            offerId: offerPlain.id,
            fileType,
        },
    });
    if (!file) return null;

    const filePlain = file.toJSON ? file.toJSON() : file;
    if (filePlain.userId !== offerPlain.project?.user?.id || filePlain.projectId !== offerPlain.projectId) {
        throw createExportError('Stored offer file metadata is inconsistent', 409);
    }

    const absolutePath = resolveStoredPath(filePlain.storagePath);
    await fs.access(absolutePath);

    return {
        ...filePlain,
        absolutePath,
        mimeType: MIME_TYPES[fileType],
        downloadUrl: buildDownloadUrl(offerPlain.id, fileType),
    };
};

export const persistOfferFile = async (offerId, fileType, actor = null, options = {}) => {
    if (!['pdf', 'excel'].includes(fileType)) {
        throw createExportError('Unsupported export file type', 400);
    }
    const regenerate = Boolean(options.regenerate);
    const requestedLang = options.language || options.lang || null;
    const offer = await offerService.getOfferById(offerId, actor);
    if (fileType === 'excel') assertExcelExportAccess(actor, offer);
    const offerPlain = offer?.toJSON ? offer.toJSON() : offer;
    if (!regenerate && !requestedLang) {
        const existing = await getStoredOfferFile(offerPlain.id, fileType, actor).catch((error) => {
            if (error?.code === 'ENOENT') return null;
            throw error;
        });
        if (existing) return existing;
    }

    const userId = offerPlain.project?.user?.id;
    if (!offerPlain.projectId || !userId) {
        throw createExportError('Offer must be linked to a project and user before files can be generated', 409);
    }

    const effectiveLang = normalizeBusinessLanguage(requestedLang || getOfferLanguage(offerPlain));
    const buffer = fileType === 'pdf'
        ? Buffer.from(await generatePdf(offerPlain.id, actor, effectiveLang))
        : Buffer.from(await generateExcel(offerPlain.id, actor, effectiveLang));

    const generatedFilename = buildGeneratedFilename(offerPlain, fileType, effectiveLang);
    const relativeStoragePath = normalizeRelativeStoragePath(path.join(
        sanitizeFilenamePart(userId, 'user'),
        sanitizeFilenamePart(offerPlain.projectId, 'project'),
        sanitizeFilenamePart(offerPlain.id, 'offer'),
        generatedFilename,
    ));
    const absolutePath = resolveStoredPath(relativeStoragePath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    const fileRecord = await models.OfferFile.create({
        fileType,
        originalFilename: generatedFilename,
        generatedFilename,
        storagePath: relativeStoragePath,
        offerId: offerPlain.id,
        projectId: offerPlain.projectId,
        userId,
    });

    const columns = OFFER_FILE_COLUMN_BY_TYPE[fileType];
    const normalizedStatus = normalizeOfferStatus(offerPlain.status || 'draft');
    const shouldMarkGenerated = ['draft', 'in_progress'].includes(normalizedStatus);
    const offerPatch = {
        [columns.id]: fileRecord.id,
        [columns.path]: relativeStoragePath,
        ...(shouldMarkGenerated ? { status: 'offer_generated' } : {}),
    };

    await models.Offer.update(offerPatch, {
        where: { id: offerPlain.id },
    });
    if (shouldMarkGenerated) {
        await followupService.syncOfferFollowup(offerPlain.id, 'offer_generated');
    }

    const filePlain = fileRecord.toJSON ? fileRecord.toJSON() : fileRecord;
    return {
        ...filePlain,
        absolutePath,
        mimeType: MIME_TYPES[fileType],
        downloadUrl: buildDownloadUrl(offerPlain.id, fileType),
    };
};

export const readStoredOfferFile = async (offerId, fileType, actor = null, options = {}) => {
    const file = await persistOfferFile(offerId, fileType, actor, options);
    const buffer = await fs.readFile(file.absolutePath);
    return {
        ...file,
        buffer,
    };
};
