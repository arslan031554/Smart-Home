import ExcelJS from 'exceljs';
import models from '../../models/index.js';
import sequelize from '../config/database.js';

const { BuildingType, RoomType, SmartFunction, Product, ProductRange, Color, ProductFunctionMapping } = models;

const BRAND = {
    name: process.env.APP_BRAND_NAME || 'Smart Building Configurator',
};

// Colors for premium Excel design
const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } };
const headerFont = { bold: true, color: { argb: 'FFFFFF' } };

/**
 * Standard utility to parse values representing booleans safely
 */
function parseBoolean(val, defaultValue = true) {
    if (val === undefined || val === null || val === '') return defaultValue;
    if (typeof val === 'boolean') return val;
    const str = String(val).trim().toLowerCase();
    if (['true', 'yes', '1', 'y', 't', 'active'].includes(str)) return true;
    if (['false', 'no', '0', 'n', 'f', 'inactive'].includes(str)) return false;
    return defaultValue;
}

/**
 * Maps varying header titles to standardized javascript object property names
 */
const standardHeaderMaps = {
    'name': 'name',
    'name ro': 'nameRo',
    'namero': 'nameRo',
    'description': 'description',
    'description ro': 'descriptionRo',
    'descriptionro': 'descriptionRo',
    'is active': 'isActive',
    'isactive': 'isActive',
    'building types': 'buildingTypes',
    'buildingtypes': 'buildingTypes',
    'code': 'code',
    'input channel count': 'inputChannelCount',
    'inputchannelcount': 'inputChannelCount',
    'output channel count': 'outputChannelCount',
    'outputchannelcount': 'outputChannelCount',
    'general channel count': 'generalChannelCount',
    'generalchannelcount': 'generalChannelCount',
    'channel type': 'channelType',
    'channeltype': 'channelType',
    'sort order': 'sortOrder',
    'sortorder': 'sortOrder',
    'room types': 'roomTypes',
    'roomtypes': 'roomTypes',
    'price': 'price',
    'product type': 'productType',
    'producttype': 'productType',
    'product ranges': 'productRanges',
    'productranges': 'productRanges',
    'colors': 'colors',
    'smart functions': 'smartFunctions',
    'smartfunctions': 'smartFunctions'
};

/**
 * Generates an Excel Template buffer with sample data
 */
export const generateTemplate = async (type) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = BRAND.name;
    workbook.created = new Date();

    if (type === 'buildings') {
        const sheet = workbook.addWorksheet('Buildings Template');
        sheet.columns = [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Name RO', key: 'nameRo', width: 25 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'Description RO', key: 'descriptionRo', width: 40 },
            { header: 'Is Active', key: 'isActive', width: 12 }
        ];
        sheet.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });
        sheet.addRow({ name: 'Villa', nameRo: 'Vilă', description: 'Detached residential home', descriptionRo: 'Casă rezidențială individuală', isActive: 'TRUE' });
        sheet.addRow({ name: 'Apartment', nameRo: 'Apartament', description: 'Standard apartment unit', descriptionRo: 'Unitate standard de apartament', isActive: 'TRUE' });
        sheet.addRow({ name: 'Office', nameRo: 'Birou', description: 'Commercial office space', descriptionRo: 'Spațiu de birouri comercial', isActive: 'FALSE' });

    } else if (type === 'rooms') {
        const sheet = workbook.addWorksheet('Rooms Template');
        sheet.columns = [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Name RO', key: 'nameRo', width: 25 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'Description RO', key: 'descriptionRo', width: 40 },
            { header: 'Is Active', key: 'isActive', width: 12 },
            { header: 'Building Types', key: 'buildingTypes', width: 35 }
        ];
        sheet.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });
        sheet.addRow({ name: 'Living Room', nameRo: 'Living', description: 'Main living space', descriptionRo: 'Spațiu principal de locuit', isActive: 'TRUE', buildingTypes: 'Villa, Apartment' });
        sheet.addRow({ name: 'Kitchen', nameRo: 'Bucătărie', description: 'Cooking area', descriptionRo: 'Zonă de gătit', isActive: 'TRUE', buildingTypes: 'Villa, Apartment, Office' });
        sheet.addRow({ name: 'Server Room', nameRo: 'Camera Server', description: 'IT equipment room', descriptionRo: 'Cameră echipamente IT', isActive: 'TRUE', buildingTypes: 'Office' });

    } else if (type === 'functions') {
        const sheet = workbook.addWorksheet('Functions Template');
        sheet.columns = [
            { header: 'Code', key: 'code', width: 18 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Name RO', key: 'nameRo', width: 25 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'Description RO', key: 'descriptionRo', width: 40 },
            { header: 'Input Channel Count', key: 'inputChannelCount', width: 20 },
            { header: 'Output Channel Count', key: 'outputChannelCount', width: 20 },
            { header: 'General Channel Count', key: 'generalChannelCount', width: 20 },
            { header: 'Channel Type', key: 'channelType', width: 15 },
            { header: 'Sort Order', key: 'sortOrder', width: 12 },
            { header: 'Is Active', key: 'isActive', width: 12 },
            { header: 'Room Types', key: 'roomTypes', width: 35 }
        ];
        sheet.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });
        sheet.addRow({
            code: 'LIGHT_CTRL',
            name: 'Lighting Control',
            nameRo: 'Control Iluminat',
            description: 'On/Off and dimming light control',
            descriptionRo: 'Control pornit/oprit și reglare intensitate lumini',
            inputChannelCount: 1,
            outputChannelCount: 1,
            generalChannelCount: 0,
            channelType: 'GENERAL',
            sortOrder: 10,
            isActive: 'TRUE',
            roomTypes: 'Living Room, Kitchen'
        });
        sheet.addRow({
            code: 'HEATING_CTRL',
            name: 'Heating Control',
            nameRo: 'Control Încălzire',
            description: 'Thermostat-based temperature control',
            descriptionRo: 'Control temperatură pe bază de termostat',
            inputChannelCount: 0,
            outputChannelCount: 0,
            generalChannelCount: 1,
            channelType: 'GENERAL',
            sortOrder: 20,
            isActive: 'TRUE',
            roomTypes: 'Living Room'
        });

    } else if (type === 'devices') {
        const sheet = workbook.addWorksheet('Devices Template');
        sheet.columns = [
            { header: 'Code', key: 'code', width: 18 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Name RO', key: 'nameRo', width: 25 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'Description RO', key: 'descriptionRo', width: 40 },
            { header: 'Price', key: 'price', width: 15 },
            { header: 'Product Type', key: 'productType', width: 15 },
            { header: 'Is Active', key: 'isActive', width: 12 },
            { header: 'Product Ranges', key: 'productRanges', width: 30 },
            { header: 'Colors', key: 'colors', width: 30 },
            { header: 'Smart Functions', key: 'smartFunctions', width: 30 }
        ];
        sheet.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });
        sheet.addRow({
            code: 'ACT_8CH_16A',
            name: '8-Channel Actuator 16A',
            nameRo: 'Actuator 8 canale 16A',
            description: 'Switching actuator for lights/sockets',
            descriptionRo: 'Actuator de comutare pentru lumini/prize',
            price: 349.99,
            productType: 'STANDARD',
            isActive: 'TRUE',
            productRanges: 'Standard Range, Premium Range',
            colors: 'White, Anthracite',
            smartFunctions: 'LIGHT_CTRL'
        });
        sheet.addRow({
            code: 'REL_SW_1CH',
            name: 'Single Relay Module',
            nameRo: 'Modul releu simplu',
            description: 'Auxiliary relay module',
            descriptionRo: 'Modul releu auxiliar',
            price: 24.50,
            productType: 'RELATED',
            isActive: 'TRUE',
            productRanges: 'Standard Range',
            colors: 'White',
            smartFunctions: ''
        });
    } else {
        throw new Error('Invalid template type requested');
    }

    return await workbook.xlsx.writeBuffer();
};

/**
 * Utility to read and return clean row data array from worksheet buffer
 */
async function parseWorksheet(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
        throw new Error('Worksheet not found in Excel workbook');
    }

    const headers = [];
    sheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.value || '').trim();
    });

    const rows = [];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return; // Skip headers
        
        const rowData = {};
        let hasData = false;
        
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
                const normalizedHeader = header.toLowerCase().replace(/_/g, ' ').trim();
                const propKey = standardHeaderMaps[normalizedHeader] || header;

                let val = cell.value;
                if (val && typeof val === 'object' && val.result !== undefined) {
                    val = val.result;
                }
                
                rowData[propKey] = val;
                if (val !== undefined && val !== null && String(val).trim() !== '') {
                    hasData = true;
                }
            }
        });

        if (hasData) {
            rowData._rowNum = rowNumber;
            rows.push(rowData);
        }
    });

    return rows;
}

/**
 * Import Buildings (BuildingTypes) from Excel
 */
export const importBuildings = async (buffer) => {
    const rows = await parseWorksheet(buffer);
    const t = await sequelize.transaction();
    let createdCount = 0;
    let updatedCount = 0;

    try {
        for (const row of rows) {
            const name = String(row.name || '').trim();
            if (!name) {
                throw new Error(`Row ${row._rowNum}: Name is required`);
            }

            const translations = {
                name: {
                    en: name,
                    ro: String(row.nameRo || '').trim() || name
                },
                description: {
                    en: String(row.description || '').trim(),
                    ro: String(row.descriptionRo || '').trim() || String(row.description || '').trim()
                }
            };
            const isActive = parseBoolean(row.isActive, true);

            let building = await BuildingType.findOne({ where: { name }, transaction: t });
            if (building) {
                await building.update({
                    description: translations.description.en,
                    translations,
                    isActive
                }, { transaction: t });
                updatedCount++;
            } else {
                await BuildingType.create({
                    name,
                    description: translations.description.en,
                    translations,
                    isActive
                }, { transaction: t });
                createdCount++;
            }
        }
        await t.commit();
        return { createdCount, updatedCount };
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

/**
 * Import Rooms (RoomTypes) from Excel
 */
export const importRooms = async (buffer) => {
    const rows = await parseWorksheet(buffer);
    const t = await sequelize.transaction();
    let createdCount = 0;
    let updatedCount = 0;

    try {
        for (const row of rows) {
            const name = String(row.name || '').trim();
            if (!name) {
                throw new Error(`Row ${row._rowNum}: Name is required`);
            }

            const translations = {
                name: {
                    en: name,
                    ro: String(row.nameRo || '').trim() || name
                },
                description: {
                    en: String(row.description || '').trim(),
                    ro: String(row.descriptionRo || '').trim() || String(row.description || '').trim()
                }
            };
            const isActive = parseBoolean(row.isActive, true);

            // Resolve Building Types
            const buildingNames = row.buildingTypes
                ? String(row.buildingTypes).split(',').map(s => s.trim()).filter(Boolean)
                : [];
            
            const buildingTypeIds = [];
            for (const bName of buildingNames) {
                const bType = await BuildingType.findOne({
                    where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), bName.toLowerCase()),
                    transaction: t
                });
                if (!bType) {
                    throw new Error(`Row ${row._rowNum}: Building type "${bName}" not found. Please create it first.`);
                }
                buildingTypeIds.push(bType.id);
            }

            let room = await RoomType.findOne({ where: { name }, transaction: t });
            if (room) {
                await room.update({
                    description: translations.description.en,
                    translations,
                    isActive
                }, { transaction: t });
                await room.setBuildingTypes(buildingTypeIds, { transaction: t });
                updatedCount++;
            } else {
                const newRoom = await RoomType.create({
                    name,
                    description: translations.description.en,
                    translations,
                    isActive
                }, { transaction: t });
                await newRoom.setBuildingTypes(buildingTypeIds, { transaction: t });
                createdCount++;
            }
        }
        await t.commit();
        return { createdCount, updatedCount };
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

/**
 * Import Functions (SmartFunctions) from Excel
 */
export const importFunctions = async (buffer) => {
    const rows = await parseWorksheet(buffer);
    const t = await sequelize.transaction();
    let createdCount = 0;
    let updatedCount = 0;

    try {
        for (const row of rows) {
            const code = String(row.code || '').trim().toUpperCase();
            const name = String(row.name || '').trim();
            if (!code) {
                throw new Error(`Row ${row._rowNum}: Code is required`);
            }
            if (!name) {
                throw new Error(`Row ${row._rowNum}: Name is required`);
            }

            const translations = {
                name: {
                    en: name,
                    ro: String(row.nameRo || '').trim() || name
                },
                description: {
                    en: String(row.description || '').trim(),
                    ro: String(row.descriptionRo || '').trim() || String(row.description || '').trim()
                }
            };
            
            const inputChannelCount = parseInt(row.inputChannelCount || 0, 10);
            const outputChannelCount = parseInt(row.outputChannelCount || 0, 10);
            const generalChannelCount = parseInt(row.generalChannelCount || 0, 10);
            
            const rawChannelType = String(row.channelType || 'GENERAL').toUpperCase().trim();
            const channelType = ['IN', 'OUT', 'GENERAL'].includes(rawChannelType) ? rawChannelType : 'GENERAL';
            
            const sortOrder = parseInt(row.sortOrder || 0, 10);
            const isActive = parseBoolean(row.isActive, true);

            // Resolve Room Types
            const roomNames = row.roomTypes
                ? String(row.roomTypes).split(',').map(s => s.trim()).filter(Boolean)
                : [];
            
            const roomTypeIds = [];
            for (const rName of roomNames) {
                const rType = await RoomType.findOne({
                    where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), rName.toLowerCase()),
                    transaction: t
                });
                if (!rType) {
                    throw new Error(`Row ${row._rowNum}: Room type "${rName}" not found. Please create it first.`);
                }
                roomTypeIds.push(rType.id);
            }

            let sf = await SmartFunction.findOne({ where: { code }, transaction: t });
            if (sf) {
                await sf.update({
                    name,
                    description: translations.description.en,
                    translations,
                    inputChannelCount,
                    outputChannelCount,
                    generalChannelCount,
                    channelType,
                    sortOrder,
                    isActive
                }, { transaction: t });
                await sf.setRoomTypes(roomTypeIds, { transaction: t });
                updatedCount++;
            } else {
                const newSf = await SmartFunction.create({
                    code,
                    name,
                    description: translations.description.en,
                    translations,
                    inputChannelCount,
                    outputChannelCount,
                    generalChannelCount,
                    channelType,
                    sortOrder,
                    isActive
                }, { transaction: t });
                await newSf.setRoomTypes(roomTypeIds, { transaction: t });
                createdCount++;
            }
        }
        await t.commit();
        return { createdCount, updatedCount };
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

/**
 * Import Devices (Products) from Excel
 */
export const importDevices = async (buffer) => {
    const rows = await parseWorksheet(buffer);
    const t = await sequelize.transaction();
    let createdCount = 0;
    let updatedCount = 0;

    try {
        for (const row of rows) {
            const code = String(row.code || '').trim();
            const name = String(row.name || '').trim();
            if (!code) {
                throw new Error(`Row ${row._rowNum}: Code is required`);
            }
            if (!name) {
                throw new Error(`Row ${row._rowNum}: Name is required`);
            }

            const priceVal = parseFloat(row.price);
            if (isNaN(priceVal) || priceVal <= 0) {
                throw new Error(`Row ${row._rowNum}: Price is required and must be a number greater than 0`);
            }

            const translations = {
                name: {
                    en: name,
                    ro: String(row.nameRo || '').trim() || name
                },
                description: {
                    en: String(row.description || '').trim(),
                    ro: String(row.descriptionRo || '').trim() || String(row.description || '').trim()
                }
            };

            const rawProductType = String(row.productType || 'STANDARD').toUpperCase().trim();
            const productType = rawProductType === 'RELATED' ? 'RELATED' : 'STANDARD';
            const isActive = parseBoolean(row.isActive, true);

            // Resolve Ranges
            const rangeNames = row.productRanges
                ? String(row.productRanges).split(',').map(s => s.trim()).filter(Boolean)
                : [];
            const rangeIds = [];
            for (const rName of rangeNames) {
                const range = await ProductRange.findOne({
                    where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), rName.toLowerCase()),
                    transaction: t
                });
                if (!range) {
                    throw new Error(`Row ${row._rowNum}: Product range "${rName}" not found. Please create it first.`);
                }
                rangeIds.push(range.id);
            }

            // Resolve Colors
            const colorNames = row.colors
                ? String(row.colors).split(',').map(s => s.trim()).filter(Boolean)
                : [];
            const colorIds = [];
            for (const cName of colorNames) {
                const color = await Color.findOne({
                    where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), cName.toLowerCase()),
                    transaction: t
                });
                if (!color) {
                    throw new Error(`Row ${row._rowNum}: Color "${cName}" not found. Please create it first.`);
                }
                colorIds.push(color.id);
            }

            // Resolve Smart Functions
            const funcCodes = row.smartFunctions
                ? String(row.smartFunctions).split(',').map(s => s.trim()).filter(Boolean)
                : [];
            const smartFunctionIds = [];
            for (const fCode of funcCodes) {
                const sf = await SmartFunction.findOne({
                    where: sequelize.where(sequelize.fn('lower', sequelize.col('code')), fCode.toLowerCase()),
                    transaction: t
                });
                if (!sf) {
                    throw new Error(`Row ${row._rowNum}: Smart function with code "${fCode}" not found. Please create it first.`);
                }
                smartFunctionIds.push(sf.id);
            }

            let product = await Product.findOne({ where: { code }, transaction: t });
            if (product) {
                await product.update({
                    name,
                    description: translations.description.en,
                    translations,
                    unitPriceEurExVat: priceVal,
                    productType,
                    isActive
                }, { transaction: t });
                await product.setProductRanges(rangeIds, { transaction: t });
                await product.setColors(colorIds, { transaction: t });

                // Sync Smart Function mappings
                if (productType === 'STANDARD') {
                    await ProductFunctionMapping.destroy({ where: { productId: product.id }, transaction: t });
                    for (const sfId of smartFunctionIds) {
                        await ProductFunctionMapping.create({
                            productId: product.id,
                            smartFunctionId: sfId,
                            channelType: 'GENERAL',
                            capacity: 1,
                            priority: 0,
                            calculationScope: 'room',
                            isActive: true
                        }, { transaction: t });
                    }
                }
                updatedCount++;
            } else {
                const newProduct = await Product.create({
                    code,
                    name,
                    description: translations.description.en,
                    translations,
                    unitPriceEurExVat: priceVal,
                    productType,
                    isActive
                }, { transaction: t });
                await newProduct.setProductRanges(rangeIds, { transaction: t });
                await newProduct.setColors(colorIds, { transaction: t });

                // Smart Function mappings
                if (productType === 'STANDARD') {
                    for (const sfId of smartFunctionIds) {
                        await ProductFunctionMapping.create({
                            productId: newProduct.id,
                            smartFunctionId: sfId,
                            channelType: 'GENERAL',
                            capacity: 1,
                            priority: 0,
                            calculationScope: 'room',
                            isActive: true
                        }, { transaction: t });
                    }
                }
                createdCount++;
            }
        }
        await t.commit();
        return { createdCount, updatedCount };
    } catch (err) {
        await t.rollback();
        throw err;
    }
};
