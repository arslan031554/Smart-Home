import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import models from '../../models/index.js';
import * as offerService from './offerservice.js';
import { getLocalizedFlatValue, getLocalizedValue, normalizeBusinessLanguage, serializeLocalizedEntity } from '../utils/localization.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGE_SIZE = [595.28, 841.89];
const PAGE_MARGIN = 42;
const FOOTER_Y = 34;
const BRAND_TITLE = process.env.PDF_BRAND_TITLE || 'Green Electric Innovations';
const BRAND_CURRENCY = process.env.APP_CURRENCY || 'EUR';
const BRAND_LOCALE = process.env.APP_LOCALE || 'en-GB';

const COLORS = {
    forest: rgb(0.025, 0.125, 0.09),
    forestSoft: rgb(0.055, 0.22, 0.15),
    green: rgb(0.31, 0.65, 0.18),
    greenDark: rgb(0.18, 0.48, 0.1),
    greenPale: rgb(0.94, 0.975, 0.92),
    gold: rgb(0.82, 0.63, 0.2),
    ink: rgb(0.08, 0.11, 0.095),
    body: rgb(0.2, 0.25, 0.22),
    muted: rgb(0.42, 0.47, 0.44),
    line: rgb(0.84, 0.88, 0.85),
    panel: rgb(0.975, 0.985, 0.97),
    white: rgb(1, 1, 1),
};

const safeNum = (value, fallback = 0) => (
    value != null && !Number.isNaN(Number(value)) ? Number(value) : fallback
);

const getOfferDate = (offer) => (
    offer.generatedAt ? new Date(offer.generatedAt) : new Date(offer.createdAt || Date.now())
);

function getFinancials(offer) {
    const snapshot = offer?.calculationSnapshot || {};
    const stored = snapshot.calculationBreakdown || {};
    const multiplier = Math.max(
        1,
        parseInt(
            stored.projectMultiplier
            ?? snapshot.projectInfo?.projectMultiplicationIndex
            ?? offer?.project?.multiplicationIndex
            ?? 1,
            10,
        ) || 1,
    );
    const productsSubtotal = safeNum(offer?.productsSubtotal);
    const servicesSubtotal = safeNum(offer?.servicesSubtotal);
    const grossTotal = safeNum(stored.grossTotal, productsSubtotal + servicesSubtotal);

    return {
        projectMultiplier: multiplier,
        productsSubtotalPerProject: safeNum(stored.productsSubtotalPerProject, productsSubtotal / multiplier),
        servicesSubtotalPerProject: safeNum(stored.servicesSubtotalPerProject, servicesSubtotal / multiplier),
        totalPerProject: safeNum(stored.totalPerProject, grossTotal / multiplier),
        grossTotal: safeNum(stored.grossTotal, grossTotal),
        discountPercent: safeNum(stored.discountPercent, offer?.discountPercent),
        discountAmount: safeNum(stored.discountAmount, offer?.discountAmount),
        grandTotal: safeNum(stored.grandTotal, offer?.grandTotal),
    };
}

function translate(lang, key) {
    const labels = {
        en: {
            proposal: 'SMART BUILDING PROPOSAL', officialQuotation: 'Commercial offer',
            preparedFor: 'Prepared for', offerNumber: 'Offer number', date: 'Date', status: 'Status', email: 'Email',
            project: 'Project', buildingType: 'Building type', levels: 'Levels', builtUpArea: 'Built-up area',
            complexity: 'Complexity', multiplier: 'Project multiplier', investment: 'ESTIMATED INVESTMENT',
            exclVat: 'excluding VAT', projectOverview: 'PROJECT OVERVIEW', buildingDescription: 'Building description',
            projectNotes: 'Project notes', functions: 'SMART FUNCTIONS', noFunctions: 'No configured functions',
            products: 'PRODUCTS & EQUIPMENT', relatedProducts: 'RELATED PRODUCTS', product: 'Product / specification',
            qty: 'Qty', unitPrice: 'Unit price', subtotal: 'Subtotal', noProducts: 'No products included',
            services: 'SERVICES & INSTALLATION', service: 'Service / description', noServices: 'No services included',
            financialSummary: 'FINANCIAL SUMMARY', productsPerProject: 'Products per project',
            servicesPerProject: 'Services per project', totalPerProject: 'Total per project', grossTotal: 'Gross total',
            discount: 'Discount', discountAmount: 'Discount amount', grandTotal: 'GRAND TOTAL',
            conditions: 'OFFER CONDITIONS', disclaimer: 'DISCLAIMER', comments: 'CUSTOMER COMMENTS',
            noComments: 'No customer comments were provided.', noConditions: 'Standard commercial terms apply.',
            noDisclaimer: 'Standard technical terms apply.', continued: 'continued',
            confidential: 'Client proposal - confidential', page: 'Page',
            thankYou: 'Thank you for choosing Green Electric Innovations.',
        },
        ro: {
            proposal: 'PROPUNERE CLADIRE INTELIGENTA', officialQuotation: 'Oferta comerciala',
            preparedFor: 'Pregatita pentru', offerNumber: 'Numar oferta', date: 'Data', status: 'Status', email: 'Email',
            project: 'Proiect', buildingType: 'Tip cladire', levels: 'Niveluri', builtUpArea: 'Suprafata construita',
            complexity: 'Complexitate', multiplier: 'Multiplicator proiect', investment: 'INVESTITIE ESTIMATA',
            exclVat: 'fara TVA', projectOverview: 'PREZENTARE PROIECT', buildingDescription: 'Descriere cladire',
            projectNotes: 'Note proiect', functions: 'FUNCTII INTELIGENTE', noFunctions: 'Nu exista functii configurate',
            products: 'PRODUSE SI ECHIPAMENTE', relatedProducts: 'PRODUSE CONEXE', product: 'Produs / specificatie',
            qty: 'Cant.', unitPrice: 'Pret unitar', subtotal: 'Subtotal', noProducts: 'Nu sunt incluse produse',
            services: 'SERVICII SI INSTALARE', service: 'Serviciu / descriere', noServices: 'Nu sunt incluse servicii',
            financialSummary: 'REZUMAT FINANCIAR', productsPerProject: 'Produse per proiect',
            servicesPerProject: 'Servicii per proiect', totalPerProject: 'Total per proiect', grossTotal: 'Total brut',
            discount: 'Discount', discountAmount: 'Valoare discount', grandTotal: 'TOTAL GENERAL',
            conditions: 'CONDITII OFERTA', disclaimer: 'DISCLAIMER', comments: 'COMENTARII CLIENT',
            noComments: 'Nu au fost adaugate comentarii de catre client.', noConditions: 'Se aplica conditiile comerciale standard.',
            noDisclaimer: 'Se aplica termenii tehnici standard.', continued: 'continuare',
            confidential: 'Propunere client - confidential', page: 'Pagina',
            thankYou: 'Va multumim ca ati ales Green Electric Innovations.',
        },
    };
    return labels[lang]?.[key] || labels.en[key] || key;
}

function pdfSafe(value) {
    return String(value ?? '')
        .replace(/[ȘŞșş]/g, (letter) => (letter === letter.toUpperCase() ? 'S' : 's'))
        .replace(/[ȚŢțţ]/g, (letter) => (letter === letter.toUpperCase() ? 'T' : 't'))
        .replace(/[ĂăÂâ]/g, (letter) => (letter === letter.toUpperCase() ? 'A' : 'a'))
        .replace(/[Îî]/g, (letter) => (letter === letter.toUpperCase() ? 'I' : 'i'))
        .replace(/[–—]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...')
        .replace(/\u00a0/g, ' ').replace(/[^\x20-\x7e\xa0-\xff]/g, '');
}

function wrapText(value, maxWidth, fontSize, font) {
    const words = pdfSafe(value).split(/\s+/).filter(Boolean);
    if (!words.length) return [''];
    const lines = [];
    let current = '';
    const flushLongWord = (word) => {
        let fragment = '';
        for (const character of word) {
            const next = fragment + character;
            if (fragment && font.widthOfTextAtSize(next, fontSize) > maxWidth) {
                lines.push(fragment);
                fragment = character;
            } else fragment = next;
        }
        return fragment;
    };
    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) current = candidate;
        else {
            if (current) lines.push(current);
            current = font.widthOfTextAtSize(word, fontSize) > maxWidth ? flushLongWord(word) : word;
        }
    }
    if (current) lines.push(current);
    return lines;
}

async function loadImageBytes(imageUrl) {
    if (!imageUrl) return null;
    try {
        if (imageUrl.startsWith('data:image/')) {
            const [meta, encoded] = imageUrl.split(',');
            return encoded ? { bytes: Buffer.from(encoded, 'base64'), type: meta.toLowerCase() } : null;
        }
        if (/^https?:\/\//i.test(imageUrl)) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            try {
                const response = await fetch(imageUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (!response.ok) return null;
                return { bytes: Buffer.from(await response.arrayBuffer()), type: String(response.headers.get('content-type') || imageUrl).toLowerCase() };
            } catch {
                clearTimeout(timeoutId);
                return null;
            }
        }
        const absolutePath = path.isAbsolute(imageUrl) ? imageUrl : path.resolve(process.cwd(), imageUrl);
        return { bytes: await fs.readFile(absolutePath), type: imageUrl.toLowerCase() };
    } catch {
        return null;
    }
}

async function embedImage(pdfDoc, imageUrl) {
    try {
        const loaded = await loadImageBytes(imageUrl);
        if (!loaded) return null;
        if (loaded.type.includes('png') || String(imageUrl).toLowerCase().endsWith('.png')) return await pdfDoc.embedPng(loaded.bytes);
        if (loaded.type.includes('jpeg') || loaded.type.includes('jpg') || /\.jpe?g$/i.test(String(imageUrl))) return await pdfDoc.embedJpg(loaded.bytes);
    } catch { return null; }
    return null;
}

async function embedBrandLogo(pdfDoc) {
    const candidates = [
        process.env.PDF_BRAND_LOGO_PATH,
        path.resolve(__dirname, '..', '..', '..', 'frontend', 'public', 'images', 'green-electric-logo.png'),
        path.resolve(process.cwd(), 'frontend', 'public', 'images', 'green-electric-logo.png'),
        path.resolve(process.cwd(), '..', 'frontend', 'public', 'images', 'green-electric-logo.png'),
    ].filter(Boolean);
    for (const candidate of candidates) {
        const logo = await embedImage(pdfDoc, candidate);
        if (logo) return logo;
    }
    return null;
}

function drawRightAligned(page, text, right, y, size, font, color = COLORS.ink) {
    const safeText = pdfSafe(text);
    page.drawText(safeText, { x: right - font.widthOfTextAtSize(safeText, size), y, size, font, color });
}

function formatAmount(value, locale = BRAND_LOCALE) {
    return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(safeNum(value))} ${BRAND_CURRENCY}`;
}

export async function generateBrandedPdf(offerId, actor = null, requestedLang = null) {
    const offerRecord = await offerService.getOfferById(offerId, actor);
    if (!offerRecord) throw new Error('Offer not found');

    const offer = offerRecord.toJSON ? offerRecord.toJSON() : offerRecord;
    const lang = normalizeBusinessLanguage(requestedLang || offer?.calculationSnapshot?.language);
    const locale = lang === 'ro' ? 'ro-RO' : 'en-GB';
    const snapshot = offer.calculationSnapshot || {};
    const project = offer.project || {};
    const projectInfo = snapshot.projectInfo || {};
    const products = Array.isArray(offer.products) ? offer.products : [];
    const services = Array.isArray(offer.services) ? offer.services : [];
    const financials = getFinancials(offer);
    const projectName = getLocalizedFlatValue(
        projectInfo,
        'name',
        lang,
        getLocalizedFlatValue(project, 'name', lang, project.name || '-'),
    );
    const customerName = project.user?.fullName || '-';
    const customerEmail = project.user?.email || '-';
    const [conditions, disclaimers, productRecords, serviceRecords] = await Promise.all([
        models.OfferCondition.findAll({ where: { isActive: true }, order: [['order', 'ASC']] }),
        models.Disclaimer.findAll({ where: { isActive: true }, order: [['order', 'ASC']] }),
        products.length ? models.Product.findAll({ where: { id: products.map((item) => item.productId).filter(Boolean) } }) : Promise.resolve([]),
        services.length ? models.Service.findAll({ where: { id: services.map((item) => item.serviceId).filter(Boolean) } }) : Promise.resolve([]),
    ]);

    const conditionTexts = conditions.map((item) => getLocalizedValue(item, 'text', lang, item?.text)).filter(Boolean);
    const disclaimerTexts = disclaimers.map((item) => getLocalizedValue(item, 'text', lang, item?.text)).filter(Boolean);
    const productRecordMap = new Map(productRecords.map((item) => {
        const plain = item.toJSON ? item.toJSON() : item;
        return [plain.id, plain];
    }));
    const serviceRecordMap = new Map(serviceRecords.map((item) => {
        const plain = serializeLocalizedEntity(item, { language: lang, fields: ['name', 'description'] });
        return [plain.id, plain];
    }));
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(BRAND_TITLE);
    pdfDoc.setAuthor(BRAND_TITLE);
    pdfDoc.setSubject(`${translate(lang, 'proposal')} - ${offer.offerNumber || offer.id}`);
    pdfDoc.setCreator(BRAND_TITLE);
    pdfDoc.setProducer(BRAND_TITLE);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const logo = await embedBrandLogo(pdfDoc);
    const productImages = new Map();
    for (const product of products) {
        if (!product.productId || productImages.has(product.productId)) continue;
        const record = productRecordMap.get(product.productId) || {};
        const image = await embedImage(pdfDoc, record.imageUrl || product.imageUrl || null);
        if (image) productImages.set(product.productId, image);
    }

    let page;
    let width;
    let height;
    let y;
    const contentWidth = PAGE_SIZE[0] - (PAGE_MARGIN * 2);

    const drawPageHeader = () => {
        page.drawRectangle({ x: 0, y: height - 94, width, height: 94, color: COLORS.forest });
        page.drawRectangle({ x: 0, y: height - 98, width, height: 4, color: COLORS.green });
        if (logo) {
            const dimensions = logo.scale(1);
            const ratio = Math.min(198 / dimensions.width, 48 / dimensions.height);
            page.drawImage(logo, {
                x: PAGE_MARGIN, y: height - 72,
                width: dimensions.width * ratio, height: dimensions.height * ratio,
            });
        }
        page.drawText(pdfSafe(BRAND_TITLE.toUpperCase()), {
            x: PAGE_MARGIN, y: height - 84, size: 8, font: bold, color: COLORS.white,
        });
        drawRightAligned(page, BRAND_TITLE, width - PAGE_MARGIN, height - 38, 11, bold, COLORS.white);
        drawRightAligned(page, offer.offerNumber || offer.id, width - PAGE_MARGIN, height - 56, 9, font, COLORS.white);
        drawRightAligned(page, getOfferDate(offer).toLocaleDateString(locale), width - PAGE_MARGIN, height - 72, 8, font, rgb(0.78, 0.86, 0.81));
    };

    const addPage = () => {
        page = pdfDoc.addPage(PAGE_SIZE);
        ({ width, height } = page.getSize());
        drawPageHeader();
        y = height - 124;
    };

    const ensureSpace = (requiredHeight) => {
        if (y - requiredHeight < FOOTER_Y + 24) addPage();
    };

    const drawSectionTitle = (number, title, continued = false) => {
        ensureSpace(40);
        page.drawRectangle({ x: PAGE_MARGIN, y: y - 24, width: 24, height: 24, color: COLORS.green });
        page.drawText(String(number).padStart(2, '0'), {
            x: PAGE_MARGIN + 5.5, y: y - 17, size: 8, font: bold, color: COLORS.white,
        });
        const label = continued ? `${title} (${translate(lang, 'continued')})` : title;
        page.drawText(pdfSafe(label), { x: PAGE_MARGIN + 34, y: y - 17, size: 11, font: bold, color: COLORS.forest });
        page.drawLine({
            start: { x: PAGE_MARGIN + 34, y: y - 21 }, end: { x: width - PAGE_MARGIN, y: y - 21 },
            thickness: 0.8, color: COLORS.line,
        });
        y -= 40;
    };

    const drawParagraph = (text, options = {}) => {
        const x = options.x ?? PAGE_MARGIN;
        const size = options.size ?? 9;
        const lineHeight = options.lineHeight ?? 12;
        const textFont = options.bold ? bold : font;
        const color = options.color ?? COLORS.body;
        const lines = wrapText(text, options.maxWidth ?? contentWidth, size, textFont);
        for (const line of lines) {
            ensureSpace(lineHeight + 2);
            page.drawText(line || ' ', { x, y, size, font: textFont, color });
            y -= lineHeight;
        }
        return lines.length;
    };

    const drawInfoGrid = (items) => {
        const gap = 10;
        const cardWidth = (contentWidth - gap) / 2;
        for (let index = 0; index < items.length; index += 2) {
            ensureSpace(52);
            for (let column = 0; column < 2; column += 1) {
                const item = items[index + column];
                if (!item) continue;
                const x = PAGE_MARGIN + (column * (cardWidth + gap));
                page.drawRectangle({ x, y: y - 39, width: cardWidth, height: 43, color: COLORS.panel, borderColor: COLORS.line, borderWidth: 0.6 });
                page.drawText(pdfSafe(item.label).toUpperCase(), { x: x + 11, y: y - 10, size: 6.8, font: bold, color: COLORS.muted });
                const valueLines = wrapText(item.value ?? '-', cardWidth - 22, 9.2, bold).slice(0, 2);
                valueLines.forEach((line, lineIndex) => {
                    page.drawText(line || '-', { x: x + 11, y: y - 27 - (lineIndex * 10), size: 9.2, font: bold, color: COLORS.ink });
                });
            }
            y -= 51;
        }
    };

    const drawTableHeader = (type) => {
        ensureSpace(27);
        page.drawRectangle({ x: PAGE_MARGIN, y: y - 18, width: contentWidth, height: 24, color: COLORS.forestSoft });
        page.drawText(type === 'product' ? translate(lang, 'product') : translate(lang, 'service'), {
            x: PAGE_MARGIN + 9, y: y - 9, size: 7.3, font: bold, color: COLORS.white,
        });
        drawRightAligned(page, translate(lang, 'qty'), 388, y - 9, 7.3, bold, COLORS.white);
        drawRightAligned(page, translate(lang, 'unitPrice'), 468, y - 9, 7.3, bold, COLORS.white);
        drawRightAligned(page, translate(lang, 'subtotal'), width - PAGE_MARGIN - 8, y - 9, 7.3, bold, COLORS.white);
        y -= 27;
    };

    const drawProductSectionTitleAfterBreak = () => { drawSectionTitle(1, translate(lang, 'products'), true); drawTableHeader('product'); };
    const drawServiceSectionTitleAfterBreak = () => { drawSectionTitle(2, translate(lang, 'services'), true); drawTableHeader('service'); };

    addPage();
    page.drawText(translate(lang, 'officialQuotation').toUpperCase(), { x: PAGE_MARGIN, y, size: 7.5, font: bold, color: COLORS.greenDark });
    y -= 25;
    wrapText(projectName, contentWidth - 120, 22, bold).slice(0, 2).forEach((line) => {
        page.drawText(line, { x: PAGE_MARGIN, y, size: 22, font: bold, color: COLORS.ink });
        y -= 25;
    });
    page.drawText(`${translate(lang, 'preparedFor')} ${pdfSafe(customerName)}`, { x: PAGE_MARGIN, y, size: 10, font, color: COLORS.muted });
    y -= 16;
    page.drawText(pdfSafe(customerEmail), { x: PAGE_MARGIN, y, size: 8.5, font, color: COLORS.greenDark });
    y -= 24;

    drawInfoGrid([
        { label: translate(lang, 'offerNumber'), value: offer.offerNumber || offer.id },
        { label: translate(lang, 'date'), value: getOfferDate(offer).toLocaleDateString(locale) },
    ]);

    ensureSpace(78);
    page.drawRectangle({ x: PAGE_MARGIN, y: y - 58, width: contentWidth, height: 64, color: COLORS.forest });
    page.drawRectangle({ x: PAGE_MARGIN, y: y - 58, width: 5, height: 64, color: COLORS.gold });
    page.drawText(translate(lang, 'investment'), { x: PAGE_MARGIN + 18, y: y - 16, size: 7.5, font: bold, color: rgb(0.76, 0.85, 0.79) });
    page.drawText(translate(lang, 'exclVat'), { x: PAGE_MARGIN + 18, y: y - 38, size: 8, font, color: COLORS.white });
    drawRightAligned(page, formatAmount(financials.grandTotal, locale), width - PAGE_MARGIN - 18, y - 38, 20, bold, COLORS.white);
    y -= 82;

    drawSectionTitle(1, translate(lang, 'products'));
    drawTableHeader('product');
    if (!products.length) {
        drawParagraph(translate(lang, 'noProducts'), { color: COLORS.muted });
        y -= 8;
    } else {
        const orderedProducts = products.slice().sort(
            (a, b) => (a.lineType === 'RELATED' ? 1 : 0) - (b.lineType === 'RELATED' ? 1 : 0),
        );
        let relatedStarted = false;
        let rowIndex = 0;
        for (const product of orderedProducts) {
            if (product.lineType === 'RELATED' && !relatedStarted) {
                if (y - 26 < FOOTER_Y + 24) { addPage(); drawProductSectionTitleAfterBreak(); }
                page.drawRectangle({ x: PAGE_MARGIN, y: y - 16, width: contentWidth, height: 22, color: COLORS.greenPale });
                page.drawText(translate(lang, 'relatedProducts'), {
                    x: PAGE_MARGIN + 9, y: y - 8, size: 7.2, font: bold, color: COLORS.greenDark,
                });
                y -= 27;
                relatedStarted = true;
            }

            const record = productRecordMap.get(product.productId) || {};
            const name = getLocalizedValue(record, 'name', lang, product.productName || record.name || 'Product');
            const description = getLocalizedValue(record, 'description', lang, product.productDescription || record.description || '');
            const code = product.productCode || record.code || '';
            const image = productImages.get(product.productId);
            const descriptionLines = description ? wrapText(description, image ? 222 : 265, 7.4, font).slice(0, 4) : [];
            const rowHeight = Math.max(image ? 50 : 36, 29 + (descriptionLines.length * 9) + (code ? 9 : 0));
            if (y - rowHeight < FOOTER_Y + 24) { addPage(); drawProductSectionTitleAfterBreak(); }

            page.drawRectangle({
                x: PAGE_MARGIN, y: y - rowHeight + 5, width: contentWidth, height: rowHeight,
                color: rowIndex % 2 === 0 ? COLORS.white : COLORS.panel,
                borderColor: COLORS.line, borderWidth: 0.4,
            });
            if (image) {
                const dimensions = image.scale(1);
                const ratio = Math.min(38 / dimensions.width, 38 / dimensions.height);
                page.drawImage(image, {
                    x: PAGE_MARGIN + 8, y: y - 38,
                    width: dimensions.width * ratio, height: dimensions.height * ratio,
                });
            }
            const itemX = PAGE_MARGIN + (image ? 55 : 10);
            page.drawText(pdfSafe(name), { x: itemX, y: y - 11, size: 8.5, font: bold, color: COLORS.ink });
            descriptionLines.forEach((line, index) => {
                page.drawText(line, { x: itemX, y: y - 23 - (index * 9), size: 7.4, font, color: COLORS.muted });
            });
            if (code) {
                page.drawText(pdfSafe(code), {
                    x: itemX, y: y - 23 - (descriptionLines.length * 9),
                    size: 6.8, font: bold, color: COLORS.greenDark,
                });
            }
            drawRightAligned(page, String(safeNum(product.quantity)), 388, y - 11, 8.2, font);
            drawRightAligned(page, formatAmount(product.unitPrice, locale), 468, y - 11, 7.8, font);
            drawRightAligned(page, formatAmount(product.subtotal, locale), width - PAGE_MARGIN - 8, y - 11, 7.8, bold);
            y -= rowHeight;
            rowIndex += 1;
        }
        y -= 8;
    }

    drawSectionTitle(2, translate(lang, 'services'));
    drawTableHeader('service');
    if (!services.length) {
        drawParagraph(translate(lang, 'noServices'), { color: COLORS.muted });
        y -= 8;
    } else {
        for (let index = 0; index < services.length; index += 1) {
            const service = services[index];
            const record = serviceRecordMap.get(service.serviceId) || {};
            const name = getLocalizedValue(record, 'name', lang, service.serviceName || service.name || record.name || 'Service');
            const description = getLocalizedValue(record, 'description', lang, service.description || record.description || '');
            const descriptionLines = description ? wrapText(description, 270, 7.5, font).slice(0, 5) : [];
            const rowHeight = Math.max(36, 29 + (descriptionLines.length * 9));
            if (y - rowHeight < FOOTER_Y + 24) { addPage(); drawServiceSectionTitleAfterBreak(); }
            page.drawRectangle({
                x: PAGE_MARGIN, y: y - rowHeight + 5, width: contentWidth, height: rowHeight,
                color: index % 2 === 0 ? COLORS.white : COLORS.panel,
                borderColor: COLORS.line, borderWidth: 0.4,
            });
            page.drawText(pdfSafe(name), { x: PAGE_MARGIN + 10, y: y - 11, size: 8.5, font: bold, color: COLORS.ink });
            descriptionLines.forEach((line, lineIndex) => {
                page.drawText(line, { x: PAGE_MARGIN + 10, y: y - 23 - (lineIndex * 9), size: 7.5, font, color: COLORS.muted });
            });
            drawRightAligned(page, String(safeNum(service.calcQty, 1)), 388, y - 11, 8.2, font);
            drawRightAligned(page, formatAmount(service.unitPrice, locale), 468, y - 11, 7.8, font);
            drawRightAligned(page, formatAmount(service.subtotal, locale), width - PAGE_MARGIN - 8, y - 11, 7.8, bold);
            y -= rowHeight;
        }
        y -= 8;
    }

    const financialRows = [
        [translate(lang, 'productsPerProject'), formatAmount(financials.productsSubtotalPerProject, locale)],
        [translate(lang, 'servicesPerProject'), formatAmount(financials.servicesSubtotalPerProject, locale)],
        [translate(lang, 'totalPerProject'), formatAmount(financials.totalPerProject, locale)],
        [translate(lang, 'multiplier'), `x ${financials.projectMultiplier}`],
        [translate(lang, 'grossTotal'), formatAmount(financials.grossTotal, locale)],
        [translate(lang, 'discount'), `${financials.discountPercent.toFixed(2)}%`],
        [translate(lang, 'discountAmount'), formatAmount(financials.discountAmount, locale)],
    ];
    const summaryHeight = (financialRows.length * 24) + 72;
    ensureSpace(summaryHeight + 52);
    drawSectionTitle(3, translate(lang, 'financialSummary'));
    page.drawRectangle({
        x: PAGE_MARGIN, y: y - summaryHeight + 7, width: contentWidth, height: summaryHeight,
        color: COLORS.panel, borderColor: COLORS.line, borderWidth: 0.7,
    });
    financialRows.forEach(([label, value], index) => {
        const rowY = y - 14 - (index * 24);
        page.drawText(pdfSafe(label), { x: PAGE_MARGIN + 14, y: rowY, size: 8.6, font, color: COLORS.body });
        drawRightAligned(page, value, width - PAGE_MARGIN - 14, rowY, 8.8, index === 2 || index === 4 ? bold : font);
        page.drawLine({
            start: { x: PAGE_MARGIN + 14, y: rowY - 8 }, end: { x: width - PAGE_MARGIN - 14, y: rowY - 8 },
            thickness: 0.35, color: COLORS.line,
        });
    });
    const totalY = y - (financialRows.length * 24) - 54;
    page.drawRectangle({ x: PAGE_MARGIN + 8, y: totalY, width: contentWidth - 16, height: 48, color: COLORS.forest });
    page.drawText(translate(lang, 'grandTotal'), { x: PAGE_MARGIN + 24, y: totalY + 18, size: 9.5, font: bold, color: COLORS.white });
    drawRightAligned(page, formatAmount(financials.grandTotal, locale), width - PAGE_MARGIN - 24, totalY + 15, 17, bold, COLORS.white);
    y -= summaryHeight + 12;

    const drawTextListSection = (number, title, entries, fallback = '-') => {
        drawSectionTitle(number, title);
        if (!entries.length) {
            drawParagraph(fallback, { color: COLORS.muted });
            y -= 8;
            return;
        }
        entries.forEach((entry, index) => {
            const lines = wrapText(entry, contentWidth - 40, 8.3, font);
            const boxHeight = Math.max(32, 20 + (lines.length * 10));
            if (y - boxHeight < FOOTER_Y + 24) { addPage(); drawSectionTitle(number, title, true); }
            page.drawRectangle({
                x: PAGE_MARGIN, y: y - boxHeight + 5, width: contentWidth, height: boxHeight,
                color: COLORS.panel, borderColor: COLORS.line, borderWidth: 0.45,
            });
            page.drawRectangle({ x: PAGE_MARGIN + 10, y: y - 20, width: 18, height: 18, color: COLORS.greenPale });
            page.drawText(String(index + 1).padStart(2, '0'), {
                x: PAGE_MARGIN + 13.5, y: y - 14, size: 6.8, font: bold, color: COLORS.greenDark,
            });
            lines.forEach((line, lineIndex) => {
                page.drawText(line, {
                    x: PAGE_MARGIN + 38, y: y - 12 - (lineIndex * 10),
                    size: 8.3, font, color: COLORS.body,
                });
            });
            y -= boxHeight + 7;
        });
    };

    drawTextListSection(4, translate(lang, 'conditions'), conditionTexts, translate(lang, 'noConditions'));
    drawTextListSection(5, translate(lang, 'disclaimer'), disclaimerTexts, translate(lang, 'noDisclaimer'));

    const customerComments = getLocalizedFlatValue(
        {
            customerComments: snapshot.customerComments ?? offer.customerComments,
            customerCommentsEn: snapshot.customerCommentsEn,
            customerCommentsRo: snapshot.customerCommentsRo,
        },
        'customerComments',
        lang,
        offer.customerComments || null,
    );
    if (customerComments) {
        drawTextListSection(6, translate(lang, 'comments'), [customerComments]);
    }

    const pages = pdfDoc.getPages();
    pages.forEach((currentPage, index) => {
        const pageWidth = currentPage.getWidth();
        currentPage.drawLine({
            start: { x: PAGE_MARGIN, y: FOOTER_Y + 10 }, end: { x: pageWidth - PAGE_MARGIN, y: FOOTER_Y + 10 },
            thickness: 0.6, color: COLORS.line,
        });
        currentPage.drawText(pdfSafe(BRAND_TITLE), {
            x: PAGE_MARGIN, y: FOOTER_Y - 2, size: 7, font: bold, color: COLORS.forest,
        });
        const footerCenter = translate(lang, 'confidential');
        const centerWidth = font.widthOfTextAtSize(footerCenter, 6.5);
        currentPage.drawText(footerCenter, {
            x: (pageWidth - centerWidth) / 2, y: FOOTER_Y - 2, size: 6.5, font, color: COLORS.muted,
        });
        drawRightAligned(
            currentPage,
            `${translate(lang, 'page')} ${index + 1} / ${pages.length}`,
            pageWidth - PAGE_MARGIN,
            FOOTER_Y - 2,
            7,
            bold,
            COLORS.forest,
        );
        currentPage.drawRectangle({ x: 0, y: 0, width: pageWidth, height: 4, color: COLORS.green });
    });

    return await pdfDoc.save();
}
