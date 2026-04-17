import fs from 'fs/promises';
import path from 'path';
import ExcelJS from 'exceljs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as offerService from './offerservice.js';
import models from '../../models/index.js';
import { getLocalizedValue, normalizeBusinessLanguage, serializeLocalizedEntity } from '../utils/localization.js';

const BRAND = {
    name: process.env.APP_BRAND_NAME || 'Smart Home Configurator',
    currency: process.env.APP_CURRENCY || 'EUR',
    locale: process.env.APP_LOCALE || 'en-GB',
};

const safeNum = (v, def = 0) => (v != null && !Number.isNaN(Number(v)) ? Number(v) : def);
const offerDate = (offer) => (offer.generatedAt ? new Date(offer.generatedAt) : new Date(offer.createdAt || Date.now()));

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
            code: 'Code',
            name: 'Name',
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
            code: 'Cod',
            name: 'Denumire',
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

function splitTextIntoLines(text, maxWidth, fontSize, font) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    if (!words.length) return [''];

    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (textWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
}

function aggregateUsedFunctions(levels, smartFunctionMap) {
    const aggregated = new Map();

    (Array.isArray(levels) ? levels : []).forEach((level) => {
        (Array.isArray(level.rooms) ? level.rooms : []).forEach((room) => {
            const roomCount = Math.max(1, safeNum(room.roomCount ?? room.count, 1));
            const selections = Array.isArray(room.functionSelections)
                ? room.functionSelections
                : (Array.isArray(room.functions) ? room.functions : []);

            selections.forEach((selection) => {
                const functionId = selection?.smartFunctionId || selection?.id;
                const quantity = Math.max(0, safeNum(selection?.quantity, 0)) * roomCount;
                if (!functionId || quantity <= 0) return;

                const master = smartFunctionMap.get(functionId) || {};
                const existing = aggregated.get(functionId) || {
                    id: functionId,
                    name: master.name || selection.name || 'Configured Function',
                    description: master.description || selection.description || '',
                    icon: master.icon || selection.icon || null,
                    quantity: 0,
                };

                existing.quantity += quantity;
                aggregated.set(functionId, existing);
            });
        });
    });

    return Array.from(aggregated.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function loadImageBytes(imageUrl) {
    if (!imageUrl) return null;

    if (imageUrl.startsWith('data:image/')) {
        const parts = imageUrl.split(',');
        if (parts.length !== 2) return null;
        return { bytes: Buffer.from(parts[1], 'base64'), type: parts[0].toLowerCase() };
    }

    if (/^https?:\/\//i.test(imageUrl)) {
        const response = await fetch(imageUrl);
        if (!response.ok) return null;
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = String(response.headers.get('content-type') || '').toLowerCase();
        return { bytes: buffer, type: contentType || imageUrl.toLowerCase() };
    }

    const absolutePath = path.isAbsolute(imageUrl) ? imageUrl : path.resolve(process.cwd(), imageUrl);
    const bytes = await fs.readFile(absolutePath);
    return { bytes, type: imageUrl.toLowerCase() };
}

async function embedProductImages(pdfDoc, products, productImageMap) {
    const result = new Map();

    for (const product of products) {
        const imageUrl = productImageMap.get(product.productId) || product.imageUrl || null;
        if (!imageUrl || result.has(product.productId)) continue;

        try {
            const loaded = await loadImageBytes(imageUrl);
            if (!loaded) continue;
            const type = String(loaded.type || '').toLowerCase();
            let embedded = null;

            if (type.includes('png') || imageUrl.toLowerCase().endsWith('.png')) {
                embedded = await pdfDoc.embedPng(loaded.bytes);
            } else if (type.includes('jpeg') || type.includes('jpg') || imageUrl.toLowerCase().endsWith('.jpg') || imageUrl.toLowerCase().endsWith('.jpeg')) {
                embedded = await pdfDoc.embedJpg(loaded.bytes);
            }

            if (embedded) result.set(product.productId, embedded);
        } catch {
            // Ignore image fetch/embed failures and keep rendering the offer.
        }
    }

    return result;
}

export const generateExcel = async (offerId, actor = null) => {
    const offer = await offerService.getOfferById(offerId, actor);
    if (!offer) throw new Error('Offer not found');
    const lang = getOfferLanguage(offer);
    const financials = getOfferFinancialBreakdown(offer);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = BRAND.name;
    workbook.created = new Date();

    const products = Array.isArray(offer.products) ? offer.products : [];
    const services = Array.isArray(offer.services) ? offer.services : [];
    const levels = Array.isArray(offer?.calculationSnapshot?.levels) ? offer.calculationSnapshot.levels : [];
    const projectInfo = offer?.calculationSnapshot?.projectInfo || {};

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
        [t(lang, 'date'), offerDate(offer).toLocaleDateString(BRAND.locale)],
        [t(lang, 'status'), offer.status || 'draft'],
        [t(lang, 'customer'), offer.project?.user?.fullName || '-'],
        [t(lang, 'email'), offer.project?.user?.email || '-'],
        [t(lang, 'projectName'), offer.project?.name || projectInfo.name || '-'],
        [t(lang, 'buildingType'), projectInfo.buildingTypeName || offer.project?.buildingType?.name || '-'],
        [t(lang, 'levels'), projectInfo.levelsCount || offer.project?.levelsCount || levels.length || '-'],
        [t(lang, 'builtUpArea'), projectInfo.area || offer.project?.builtUpArea || '-'],
        [t(lang, 'projectComplexity'), projectInfo.projectComplexity || offer.project?.projectComplexity || '-'],
        [t(lang, 'multiplier'), financials.projectMultiplier],
        [t(lang, 'discountPct'), `${financials.discountPercent.toFixed(2)}%`],
        [t(lang, 'grandTotal'), financials.grandTotal],
        [t(lang, 'customerComments'), offer.customerComments || '-'],
    ];
    projectRows.forEach((row) => projectSheet.addRow(row));
    projectSheet.getColumn(2).numFmt = currencyFmt;

    const productsSheet = workbook.addWorksheet('Products');
    productsSheet.columns = [
        { header: t(lang, 'code'), key: 'code', width: 18 },
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
    ['H', 'I', 'J'].forEach((col) => { productsSheet.getColumn(col).numFmt = currencyFmt; });

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

export const generatePdf = async (offerId, actor = null) => {
    const offerRecord = await offerService.getOfferById(offerId, actor);
    if (!offerRecord) throw new Error('Offer not found');

    const offer = offerRecord.toJSON ? offerRecord.toJSON() : offerRecord;
    const lang = getOfferLanguage(offer);
    const snapshot = offer.calculationSnapshot || {};
    const project = offer.project || {};
    const projectInfo = snapshot.projectInfo || {};
    const levels = Array.isArray(snapshot.levels) ? snapshot.levels : [];
    const products = Array.isArray(offer.products) ? offer.products : [];
    const services = Array.isArray(offer.services) ? offer.services : [];
    const financials = getOfferFinancialBreakdown(offer);
    const localizedBuildingType = projectInfo.buildingTypeName || (project.buildingType ? getLocalizedValue(project.buildingType, 'name', lang, project.buildingType?.name || '-') : (projectInfo.buildingType || '-'));

    const [conditions, disclaimers, smartFunctions, productRecords, serviceRecords] = await Promise.all([
        models.OfferCondition.findAll({ where: { isActive: true }, order: [['order', 'ASC']] }),
        models.Disclaimer.findAll({ where: { isActive: true }, order: [['order', 'ASC']] }),
        models.SmartFunction.findAll({ where: { isActive: true } }),
        products.length
            ? models.Product.findAll({ where: { id: products.map((product) => product.productId).filter(Boolean) } })
            : Promise.resolve([]),
        services.length
            ? models.Service.findAll({ where: { id: services.map((service) => service.serviceId).filter(Boolean) } })
            : Promise.resolve([]),
    ]);

    const conditionTexts = (conditions || []).map((item) => getLocalizedValue(item, 'text', lang, item?.text)).filter(Boolean);
    const disclaimerTexts = (disclaimers || []).map((item) => getLocalizedValue(item, 'text', lang, item?.text)).filter(Boolean);
    const smartFunctionMap = new Map((smartFunctions || []).map((item) => {
        const plain = serializeLocalizedEntity(item, { language: lang, fields: ['name', 'description'] });
        return [plain.id, plain];
    }));
    const productImageMap = new Map((productRecords || []).map((item) => {
        const plain = item.toJSON ? item.toJSON() : item;
        return [plain.id, plain.imageUrl || null];
    }));
    const serviceDescriptionMap = new Map((serviceRecords || []).map((item) => {
        const plain = serializeLocalizedEntity(item, { language: lang, fields: ['name', 'description'] });
        return [plain.id, plain.description || ''];
    }));
    const usedFunctions = aggregateUsedFunctions(levels, smartFunctionMap);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const primaryColor = rgb(0.18, 0.33, 0.59);
    const mutedColor = rgb(0.45, 0.48, 0.55);
    const lineColor = rgb(0.88, 0.9, 0.94);
    const pageSize = [595.28, 841.89];
    let page = pdfDoc.addPage(pageSize);
    let { width, height } = page.getSize();
    const margin = 48;
    const contentWidth = width - (margin * 2);
    let y = height - 50;

    const productImages = await embedProductImages(pdfDoc, products, productImageMap);

    const addPage = () => {
        page = pdfDoc.addPage(pageSize);
        ({ width, height } = page.getSize());
        y = height - 50;
    };

    const ensureSpace = (requiredHeight = 60) => {
        if (y - requiredHeight < 40) addPage();
    };

    const drawWrappedText = (text, options = {}) => {
        const {
            x = margin,
            size = 10,
            bold = false,
            color = rgb(0, 0, 0),
            maxWidth = contentWidth,
            lineGap = 13,
        } = options;

        const lines = splitTextIntoLines(text || '', maxWidth, size, bold ? fontBold : font);
        lines.forEach((line) => {
            ensureSpace(lineGap + 2);
            page.drawText(line || ' ', { x, y, size, font: bold ? fontBold : font, color });
            y -= lineGap;
        });
        return lines.length;
    };

    const drawSectionTitle = (title) => {
        ensureSpace(38);
        page.drawText(title, { x: margin, y, size: 12, font: fontBold, color: primaryColor });
        y -= 8;
        page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: lineColor });
        y -= 18;
    };

    const drawKeyValue = (label, value) => {
        const safeValue = value == null || value === '' ? '-' : String(value);
        ensureSpace(22);
        page.drawText(`${label}:`, { x: margin, y, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
        const labelWidth = fontBold.widthOfTextAtSize(`${label}:`, 10);
        const lines = splitTextIntoLines(safeValue, contentWidth - labelWidth - 12, 10, font);
        lines.forEach((line, index) => {
            ensureSpace(14);
            page.drawText(line, { x: margin + labelWidth + 8, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
            if (index !== lines.length - 1) y -= 13;
        });
        y -= 16;
    };

    const drawEmptyValue = (text) => {
        ensureSpace(18);
        page.drawText(text, { x: margin, y, size: 10, font, color: mutedColor });
        y -= 16;
    };

    page.drawText(BRAND.name.toUpperCase(), { x: margin, y, size: 20, font: fontBold, color: primaryColor });
    y -= 24;
    page.drawText(t(lang, 'officialQuotation'), { x: margin, y, size: 11, font, color: mutedColor });
    y -= 28;

    const infoLine = (label, value, x) => {
        page.drawText(`${label}:`, { x, y, size: 10, font: fontBold });
        page.drawText(String(value ?? '-'), { x: x + 82, y, size: 10, font });
    };

    infoLine(t(lang, 'offerNumber'), offer.offerNumber, margin);
    infoLine(t(lang, 'customer'), project.user?.fullName || '-', 300);
    y -= 15;
    infoLine(t(lang, 'date'), offerDate(offer).toLocaleDateString(BRAND.locale), margin);
    infoLine(t(lang, 'email'), project.user?.email || '-', 300);
    y -= 15;
    infoLine(t(lang, 'projectName'), project.name || projectInfo.name || '-', margin);
    infoLine(t(lang, 'buildingType'), localizedBuildingType, 300);
    y -= 28;

    drawSectionTitle(t(lang, 'projectChapter'));
    drawKeyValue(t(lang, 'projectName'), project.name || projectInfo.name || '-');
    drawKeyValue(t(lang, 'buildingType'), localizedBuildingType);
    drawKeyValue(t(lang, 'levels'), project.levelsCount || projectInfo.levelsCount || levels.length || '-');
    drawKeyValue(t(lang, 'builtUpArea'), project.builtUpArea ? `${project.builtUpArea} m2` : (projectInfo.area ? `${projectInfo.area} m2` : '-'));
    drawKeyValue(t(lang, 'projectComplexity'), project.projectComplexity || projectInfo.projectComplexity || '-');
    drawKeyValue(t(lang, 'multiplier'), financials.projectMultiplier);

    const buildingDescription = projectInfo.buildingTypeDescription || (project.buildingType ? getLocalizedValue(project.buildingType, 'description', lang, project.buildingType?.description || '') : '');
    if (buildingDescription) {
        drawKeyValue(t(lang, 'buildingDescription'), buildingDescription);
    }

    if (project.description || projectInfo.description) {
        drawKeyValue(t(lang, 'projectNotes'), project.description || projectInfo.description);
    }

    drawSectionTitle(t(lang, 'selectedFunctions'));
    if (usedFunctions.length === 0) {
        drawEmptyValue(t(lang, 'noConfiguredFunctions'));
    } else {
        usedFunctions.forEach((item) => {
            ensureSpace(38);
            page.drawText(`${item.name}  x ${item.quantity}`, { x: margin, y, size: 10, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
            y -= 14;
            if (item.description) {
                drawWrappedText(item.description, { x: margin + 12, size: 9, maxWidth: contentWidth - 12, color: mutedColor, lineGap: 11 });
            }
            y -= 4;
        });
    }

    drawSectionTitle(t(lang, 'productsChapter'));
    ensureSpace(22);
    page.drawRectangle({ x: margin, y: y - 4, width: contentWidth, height: 18, color: rgb(0.95, 0.96, 0.98) });
    page.drawText(t(lang, 'productSpec'), { x: margin + 6, y, size: 9, font: fontBold });
    page.drawText(t(lang, 'quantity'), { x: 370, y, size: 9, font: fontBold });
    page.drawText(t(lang, 'unitPrice'), { x: 430, y, size: 9, font: fontBold });
    page.drawText(t(lang, 'subtotal'), { x: 510, y, size: 9, font: fontBold });
    y -= 24;

    if (products.length === 0) {
        drawEmptyValue(t(lang, 'noProducts'));
    } else {
        for (const product of products) {
            const productName = product.productName || 'Product';
            const productDescription = product.productDescription || '';
            const productCode = product.productCode || '';
            const image = productImages.get(product.productId);
            const descriptionLines = productDescription
                ? splitTextIntoLines(productDescription, image ? 240 : 280, 8, font)
                : [];
            const rowHeight = Math.max(image ? 52 : 0, 22 + (descriptionLines.length * 10) + (productCode ? 10 : 0));
            ensureSpace(rowHeight + 10);

            const topY = y;
            if (image) {
                const dims = image.scale(1);
                const ratio = dims.width && dims.height ? Math.min(42 / dims.width, 42 / dims.height) : 1;
                const imgWidth = dims.width * ratio;
                const imgHeight = dims.height * ratio;
                page.drawImage(image, {
                    x: margin + 4,
                    y: topY - imgHeight + 2,
                    width: imgWidth,
                    height: imgHeight,
                });
            }

            const textX = margin + (image ? 54 : 6);
            page.drawText(productName, { x: textX, y: topY, size: 9, font: fontBold });
            let textY = topY - 11;
            descriptionLines.forEach((line) => {
                page.drawText(line, { x: textX, y: textY, size: 8, font, color: mutedColor });
                textY -= 10;
            });
            if (productCode) {
                page.drawText(productCode, { x: textX, y: textY, size: 7, font, color: mutedColor });
            }

            page.drawText(String(safeNum(product.quantity)), { x: 375, y: topY, size: 9, font });
            page.drawText(safeNum(product.unitPrice).toFixed(2), { x: 435, y: topY, size: 9, font });
            page.drawText(safeNum(product.subtotal).toFixed(2), { x: 510, y: topY, size: 9, font });
            y -= rowHeight + 8;
        }
    }

    drawSectionTitle(t(lang, 'servicesChapter'));
    ensureSpace(22);
    page.drawRectangle({ x: margin, y: y - 4, width: contentWidth, height: 18, color: rgb(0.95, 0.96, 0.98) });
    page.drawText(t(lang, 'serviceName'), { x: margin + 6, y, size: 9, font: fontBold });
    page.drawText(t(lang, 'quantity'), { x: 370, y, size: 9, font: fontBold });
    page.drawText(t(lang, 'unitPrice'), { x: 430, y, size: 9, font: fontBold });
    page.drawText(t(lang, 'subtotal'), { x: 510, y, size: 9, font: fontBold });
    y -= 24;

    if (services.length === 0) {
        drawEmptyValue(t(lang, 'noServices'));
    } else {
        services.forEach((service) => {
            const serviceName = service.serviceName || service.name || 'Service';
            const description = service.description || serviceDescriptionMap.get(service.serviceId) || '';
            const lines = description ? splitTextIntoLines(description, 300, 8, font) : [];
            const rowHeight = 18 + (lines.length * 10);
            ensureSpace(rowHeight + 8);
            const topY = y;

            page.drawText(serviceName, { x: margin + 6, y: topY, size: 9, font: fontBold });
            let textY = topY - 11;
            lines.forEach((line) => {
                page.drawText(line, { x: margin + 6, y: textY, size: 8, font, color: mutedColor });
                textY -= 10;
            });

            page.drawText(String(safeNum(service.calcQty, 1)), { x: 375, y: topY, size: 9, font });
            page.drawText(safeNum(service.unitPrice).toFixed(2), { x: 435, y: topY, size: 9, font });
            page.drawText(safeNum(service.subtotal).toFixed(2), { x: 510, y: topY, size: 9, font });
            y -= rowHeight + 8;
        });
    }

    drawSectionTitle(t(lang, 'grandTotalChapter'));
    drawKeyValue(t(lang, 'productsTotalPerProject'), `${financials.productsSubtotalPerProject.toFixed(2)} ${BRAND.currency}`);
    drawKeyValue(t(lang, 'servicesTotalPerProject'), `${financials.servicesSubtotalPerProject.toFixed(2)} ${BRAND.currency}`);
    drawKeyValue(t(lang, 'totalPerProject'), `${financials.totalPerProject.toFixed(2)} ${BRAND.currency}`);
    drawKeyValue(t(lang, 'multiplier'), financials.projectMultiplier);
    drawKeyValue(t(lang, 'grossTotal'), `${financials.grossTotal.toFixed(2)} ${BRAND.currency}`);
    drawKeyValue(t(lang, 'discountPct'), `${financials.discountPercent.toFixed(2)}%`);
    drawKeyValue(t(lang, 'discountAmount'), `${financials.discountAmount.toFixed(2)} ${BRAND.currency}`);
    drawKeyValue(t(lang, 'grandTotal'), `${financials.grandTotal.toFixed(2)} ${BRAND.currency}`);

    drawSectionTitle(t(lang, 'offerConditions'));
    if (conditionTexts.length === 0) {
        drawEmptyValue('-');
    } else {
        conditionTexts.forEach((text) => {
            drawWrappedText(`- ${text}`, { size: 9, maxWidth: contentWidth, color: rgb(0.15, 0.15, 0.15), lineGap: 12 });
            y -= 2;
        });
    }

    drawSectionTitle(t(lang, 'disclaimer'));
    if (disclaimerTexts.length === 0) {
        drawEmptyValue('-');
    } else {
        disclaimerTexts.forEach((text) => {
            drawWrappedText(`- ${text}`, { size: 9, maxWidth: contentWidth, color: rgb(0.15, 0.15, 0.15), lineGap: 12 });
            y -= 2;
        });
    }

    drawSectionTitle(t(lang, 'customerComments'));
    if (offer.customerComments && String(offer.customerComments).trim()) {
        drawWrappedText(String(offer.customerComments).trim(), { size: 9, maxWidth: contentWidth, color: rgb(0.15, 0.15, 0.15), lineGap: 12 });
    } else {
        drawEmptyValue(t(lang, 'noCustomerComments'));
    }

    return await pdfDoc.save();
};


