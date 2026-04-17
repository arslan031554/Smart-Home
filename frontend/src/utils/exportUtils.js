/**
 * Smart Home Configurator — Export Utilities
 * Generates client-facing PDF and internal Excel exports.
 * All prices in EUR, excluding VAT.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
    calculateHardwareInventory,
    calculateFinances,
    aggregateFunctionsForSummary,
} from './calculationUtils';

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

const EUR = (n) => `EUR ${Number(n || 0).toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

/**
 * Build the full calculation snapshot from current config state.
 */
function buildSnapshot(config) {
    const {
        levels = [],
        configuratorState = {},
        adminState = {}
    } = config;

    // Use canonical calculation engine
    const finances = calculateFinances({
        levels,
        adminState,
        configuratorState
    });

    const hardwareItems = finances?.hardwareSummary?.items || [];
    const functions = aggregateFunctionsForSummary(levels);
    
    // Find the range object for metadata
    const rangeId = configuratorState.range;
    const range = (adminState.productRanges || []).find(r => r.id === rangeId);

    return { 
        projectInfo: configuratorState.projectInfo || {}, 
        services: finances?.serviceResults?.details || [], 
        levels, 
        hardwareItems, 
        finances, 
        functions, 
        range, 
        conditions: adminState.conditions || [],
        disclaimers: adminState.disclaimers || [],
        customerComments: configuratorState.customerComments,
        nodeCount: finances?.hardwareSummary?.nodeCount || 0 
    };
}

// ──────────────────────────────────────────────────────────────────────
// PDF EXPORT — Client-facing Technical Offer
// ──────────────────────────────────────────────────────────────────────

export function generatePDFOffer(config, offerId) {
    const snap = buildSnapshot(config);
    const { projectInfo, services, hardwareItems, finances, functions, range } = snap;
    const pid = offerId || `HSC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    let y = 0;

    const addPage = () => {
        doc.addPage();
        y = 20;
        drawHeader();
    };

    const checkY = (needed = 20) => {
        if (y + needed > 270) addPage();
    };

    // ── Cover / Header ───────────────────────────────────────────
    const drawHeader = () => {
        doc.setFillColor(15, 23, 42); // primary-950
        doc.rect(0, 0, W, 24, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('SMART HOME CONFIGURATOR', 14, 10);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('Technical Offer', 14, 16);
        doc.text(`Offer ID: ${pid}`, W - 14, 10, { align: 'right' });
        doc.text(`Date: ${today()}`, W - 14, 16, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        y = 32;
    };

    drawHeader();

    // ── Section helper ───────────────────────────────────────────
    const sectionTitle = (title) => {
        checkY(18);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, W - 28, 9, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(title.toUpperCase(), 18, y + 6);
        y += 14;
    };

    const kvRow = (label, value, indent = 14) => {
        checkY(8);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(label, indent, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(String(value || '—'), indent + 65, y);
        y += 7;
    };

    // ── 1. Project Information ───────────────────────────────────
    sectionTitle('1. Project Information');
    kvRow('Project Name', projectInfo.name || 'Untitled');
    kvRow('Building Type', projectInfo.buildingType?.replace(/_/g, ' ') || '—');
    kvRow('Number of Floors', `${snap.levels?.length || 1}`);
    kvRow('Built-up Area', projectInfo.area ? `${projectInfo.area} m²` : '—');
    kvRow('Multiplication Index', `× ${projectInfo.projectMultiplicationIndex || 1} unit(s)`);
    kvRow('Product Range', range?.name || '—');
    if (projectInfo.description) {
        checkY(10);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        const lines = doc.splitTextToSize(projectInfo.description, W - 40);
        doc.text(lines, 18, y);
        y += lines.length * 5 + 4;
    }
    y += 4;

    // ── 2. Smart Functions Specification ─────────────────────────
    sectionTitle('2. Smart Functions Specification');
    if (snap.functions.length > 0) {
        autoTable(doc, {
            startY: y,
            margin: { left: 14, right: 14 },
            styles: { fontSize: 7.5, cellPadding: 3 },
            headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 7.5 },
            alternateRowStyles: { fillColor: [252, 252, 252] },
            columnStyles: { 
                0: { cellWidth: 45 }, 
                1: { cellWidth: 105 }, 
                2: { cellWidth: 20, halign: 'center' } 
            },
            head: [['Function', 'Description / Technical Scope', 'Quantity']],
            body: snap.functions.map(fn => [
                fn.name, 
                fn.description || 'Smart function control',
                fn.totalQty
            ]),
        });
        y = doc.lastAutoTable.finalY + 8;
    } else {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('No functions assigned.', 18, y);
        y += 10;
    }

    // ── 3. Products (BOM) ────────────────────────────────────────
    sectionTitle('3. Hardware Products (BOM)');
    if (hardwareItems.length > 0) {
        autoTable(doc, {
            startY: y,
            margin: { left: 14, right: 14 },
            styles: { fontSize: 7.5, cellPadding: 3 },
            headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 28 },
                1: { cellWidth: 70 },
                2: { cellWidth: 18, halign: 'center' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 30, halign: 'right' },
            },
            head: [['Code', 'Product', 'Quantity', 'Unit Price', 'Subtotal']],
            body: hardwareItems.map(item => [
                item.code,
                item.name,
                item.qty,
                EUR(item.price),
                EUR(item.subtotal),
            ]),
            foot: [['', 'HARDWARE SUBTOTAL (excl. VAT, excl. range multiplier)', '', '', EUR(snap.finances.hardwareTotal / (range?.priceMultiplier || 1))]],
            footStyles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [15, 23, 42] },
        });
        y = doc.lastAutoTable.finalY + 8;
    }

    // ── 4. Services ──────────────────────────────────────────────
    sectionTitle('4. Professional Services');
    if (services.length > 0) {
        autoTable(doc, {
            startY: y,
            margin: { left: 14, right: 14 },
            styles: { fontSize: 7.5, cellPadding: 3 },
            headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 85 },
                2: { cellWidth: 30, halign: 'right' },
            },
            head: [['Code', 'Service', 'Quantity', 'Unit Net', 'Subtotal Net']],
            body: services.map(s => [s.code || '—', s.name, s.calcQty || 1, EUR(s.price), EUR(s.subtotal)]),
            foot: [['', '', '', 'SERVICES SUBTOTAL', EUR(finances.servicesTotal)]],
            footStyles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [15, 23, 42] },
        });
        y = doc.lastAutoTable.finalY + 8;
    } else {
        doc.setFontSize(8); doc.setTextColor(150, 150, 150);
        doc.text('No services selected.', 18, y); y += 10;
    }

    // ── 5. Financial Summary ─────────────────────────────────────
    sectionTitle('5. Financial Summary');
    checkY(60);
    const financialRows = [
        ['Hardware Subtotal (range-adjusted, excl. VAT)', EUR(finances.hardwareTotal)],
        ['Services Subtotal', EUR(finances.servicesTotal)],
        ...(finances.units > 1 ? [[`Gross Total (× ${finances.units} units)`, EUR(finances.grossTotal)]] : []),
        ...(finances.discountPercent > 0 ? [
            [`Volume Discount (${finances.discountPercent}% for ${finances.units} units)`, `− ${EUR(finances.discountAmount)}`]
        ] : []),
    ];
    autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 46, halign: 'right', fontStyle: 'bold' } },
        head: [['Item', 'Amount (EUR excl. VAT)']],
        body: financialRows,
        foot: [['GRAND TOTAL (EUR, EXCL. VAT)', EUR(finances.grandTotal)]],
        footStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    });
    y = doc.lastAutoTable.finalY + 8;

    // ── 6. Offer Conditions ──────────────────────────────────────
    const conditions = snap.conditions || [];
    if (conditions.length > 0) {
        checkY(20);
        sectionTitle('6. Offer Conditions');
        conditions.forEach((c, i) => {
            checkY(14);
            doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59);
            doc.text(`${i + 1}.`, 18, y); y += 5;
            doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
            const lines = doc.splitTextToSize(c.text || '', W - 40);
            doc.text(lines, 22, y); y += lines.length * 4.5 + 3;
        });
        y += 4;
    }

    // ── 7. Disclaimer ────────────────────────────────────────────
    const disclaimers = snap.disclaimers || [];
    if (disclaimers.length > 0) {
        checkY(18);
        sectionTitle('7. Important Notice');
        disclaimers.forEach(d => {
            checkY(12);
            doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(100, 116, 139);
            const lines = doc.splitTextToSize(d.text || '', W - 40);
            doc.text(lines, 18, y); y += lines.length * 4.5 + 3;
        });
        y += 4;
    }

    // ── 8. Customer Comments ─────────────────────────────────────
    const comments = config.customerComments || config.projectInfo?.customerComments;
    if (comments) {
        checkY(18);
        sectionTitle('8. Customer Comments');
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(comments, W - 40);
        doc.text(lines, 18, y); y += lines.length * 5 + 6;
    }

    // ── Footer on every page ─────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${pageCount}`, W / 2, 290, { align: 'center' });
        doc.text('All prices in EUR, excluding VAT.', W - 14, 290, { align: 'right' });
    }

    doc.save(`${pid}_Client_Offer.pdf`);
}

// ──────────────────────────────────────────────────────────────────────
// EXCEL EXPORT — Internal Processing Sheet
// ──────────────────────────────────────────────────────────────────────

export function generateExcelOffer(config, offerId) {
    const snap = buildSnapshot(config);
    const { projectInfo, services, hardwareItems, finances, functions, levels } = snap;
    const pid = offerId || `HSC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Offer Summary ────────────────────────────────────
    const summaryData = [
        ['SMART HOME CONFIGURATOR — INTERNAL OFFER SHEET', '', '', ''],
        ['', '', '', ''],
        ['OFFER ID', pid, 'DATE', today()],
        ['', '', '', ''],
        ['PROJECT INFORMATION', '', '', ''],
        ['Project Name', projectInfo.name || '—', '', ''],
        ['Building Type', projectInfo.buildingType?.replace(/_/g, ' ') || '—', '', ''],
        ['Floors', snap.levels?.length || 1, '', ''],
        ['Built-up Area (m²)', projectInfo.area || '—', '', ''],
        ['Multiplication Index (units)', projectInfo.projectMultiplicationIndex || 1, '', ''],
        ['Product Range', snap.range?.name || '—', '', ''],
        ['', '', '', ''],
        ['FINANCIAL SUMMARY', '', '', ''],
        ['Hardware Subtotal (range-adjusted, excl. VAT)', '', '', finances.hardwareTotal],
        ['Services Subtotal (excl. VAT)', '', '', finances.servicesTotal],
        ...(finances.units > 1 ? [['Gross Total (all units)', '', '', finances.grossTotal]] : []),
        ...(finances.discountPercent > 0 ? [
            [`Volume Discount (${finances.discountPercent}%)`, '', '', -finances.discountAmount]
        ] : []),
        ['GRAND TOTAL (EUR, excl. VAT)', '', '', finances.grandTotal],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 45 }, { wch: 30 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Offer Summary');

    // ── Sheet 2: Hardware BOM ─────────────────────────────────────
    const bomHeader = ['Code', 'Product Name', 'Description', 'Quantity', 'Unit Price (EUR)', 'Subtotal (EUR)'];
    const bomRows = hardwareItems.map(item => [
        item.code, item.name, item.description, item.qty, item.price, item.subtotal,
    ]);
    bomRows.push(['', '', 'HARDWARE TOTAL', '', '', finances.hardwareTotal]);
    const wsBOM = XLSX.utils.aoa_to_sheet([bomHeader, ...bomRows]);
    wsBOM['!cols'] = [{ wch: 18 }, { wch: 35 }, { wch: 45 }, { wch: 8 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsBOM, 'Hardware BOM');

    // ── Sheet 3: Functions ────────────────────────────────────────
    const fnHeader = ['Function ID', 'Function Name', 'Channel Type', 'Description', 'Total Quantity'];
    const fnRows = functions.map(fn => [fn.id, fn.name, fn.channelType || '—', fn.description || '', fn.totalQty]);
    const wsFn = XLSX.utils.aoa_to_sheet([fnHeader, ...fnRows]);
    wsFn['!cols'] = [{ wch: 18 }, { wch: 30 }, { wch: 16 }, { wch: 50 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsFn, 'Smart Functions');

    // ── Sheet 4: Services ─────────────────────────────────────────
    const svcHeader = ['Code', 'Service Name', 'Quantity', 'Unit Net', 'Subtotal Net', 'Description'];
    const svcRows = services.map(s => [s.code || '—', s.name, s.calcQty || 1, s.price || 0, s.subtotal || 0, s.description || '']);
    svcRows.push(['', 'SERVICES TOTAL', '', '', finances.servicesTotal, '']);
    const wsSvc = XLSX.utils.aoa_to_sheet([svcHeader, ...svcRows]);
    wsSvc['!cols'] = [{ wch: 14 }, { wch: 35 }, { wch: 55 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, wsSvc, 'Services');

    // ── Sheet 5: Room Manifest ────────────────────────────────────
    const roomHeader = ['Level', 'Room Name', 'Room Type', 'Quantity', 'Functions Count'];
    const roomRows = [];
    levels.forEach(level => {
        level.rooms.forEach(room => {
            roomRows.push([
                level.name,
                room.name,
                room.type?.replace(/_/g, ' ') || '—',
                parseInt(room.count) || 1,
                room.functions?.length || 0,
            ]);
        });
    });
    const wsRooms = XLSX.utils.aoa_to_sheet([roomHeader, ...roomRows]);
    wsRooms['!cols'] = [{ wch: 18 }, { wch: 25 }, { wch: 22 }, { wch: 8 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsRooms, 'Room Manifest');

    XLSX.writeFile(wb, `${pid}_Internal_Export.xlsx`);
}
