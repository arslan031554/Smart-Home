import ExcelJS from 'exceljs';
import sequelize from '../src/config/database.js';
import models from '../models/index.js';
import * as calculationService from '../src/services/calculationservice.js';
import * as offerService from '../src/services/offerservice.js';
import * as exportService from '../src/services/exportservice.js';

const {
    ProductRange,
    Color,
    SmartFunction,
    Product,
    ProductRangeProduct,
    ProductColorProduct,
    ProductFunctionMapping,
    Service,
    ServiceSmartFunction,
    BuildingType,
    User,
    Project,
    Offer,
    OfferProduct,
    OfferService,
    OfferFollowup,
} = models;

const prefix = `VALIDATE-${Date.now()}`;
const created = {
    rangeIds: [],
    colorIds: [],
    functionIds: [],
    productIds: [],
    serviceIds: [],
    userIds: [],
    projectIds: [],
    offerIds: [],
    buildingTypeIds: [],
};

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function roundMoney(value) {
    return Number(Number(value || 0).toFixed(2));
}

function track(key, record) {
    if (record?.id && Array.isArray(created[key])) {
        created[key].push(record.id);
    }
    return record;
}

async function destroyByIds(model, ids) {
    if (!ids.length) return;
    await model.destroy({ where: { id: ids } });
}

async function cleanup() {
    await OfferFollowup.destroy({ where: { offerId: created.offerIds } }).catch(() => {});
    await OfferProduct.destroy({ where: { offerId: created.offerIds } }).catch(() => {});
    await OfferService.destroy({ where: { offerId: created.offerIds } }).catch(() => {});
    await destroyByIds(Offer, created.offerIds).catch(() => {});
    await destroyByIds(Project, created.projectIds).catch(() => {});
    await destroyByIds(User, created.userIds).catch(() => {});

    await ServiceSmartFunction.destroy({ where: { serviceId: created.serviceIds } }).catch(() => {});
    await ProductFunctionMapping.destroy({
        where: {
            productId: created.productIds,
        },
    }).catch(() => {});
    await ProductFunctionMapping.destroy({
        where: {
            smartFunctionId: created.functionIds,
        },
    }).catch(() => {});
    await ProductRangeProduct.destroy({ where: { productId: created.productIds } }).catch(() => {});
    await ProductColorProduct.destroy({ where: { productId: created.productIds } }).catch(() => {});

    await destroyByIds(Service, created.serviceIds).catch(() => {});
    await destroyByIds(Product, created.productIds).catch(() => {});
    await destroyByIds(SmartFunction, created.functionIds).catch(() => {});
    await destroyByIds(ProductRange, created.rangeIds).catch(() => {});
    await destroyByIds(Color, created.colorIds).catch(() => {});
    await destroyByIds(BuildingType, created.buildingTypeIds).catch(() => {});
}

async function createRange(data) {
    return track('rangeIds', await ProductRange.create(data));
}

async function createColor(data) {
    return track('colorIds', await Color.create(data));
}

async function createFunction(data) {
    return track('functionIds', await SmartFunction.create(data));
}

async function createProduct(data) {
    return track('productIds', await Product.create(data));
}

async function createService(data) {
    return track('serviceIds', await Service.create(data));
}

async function createUser(data) {
    return track('userIds', await User.create(data));
}

async function createProject(data) {
    return track('projectIds', await Project.create(data));
}

async function createValidationData() {
    const visibleRange = await createRange({
        name: `${prefix}-VISIBLE-RANGE`,
        description: 'Validation visible range',
        priceMultiplier: 1,
        isVisible: true,
        isActive: true,
    });
    const hiddenRange = await createRange({
        name: `${prefix}-HIDDEN-RANGE`,
        description: 'Validation hidden range',
        priceMultiplier: 1,
        isVisible: false,
        isActive: true,
    });

    const visibleColor = await createColor({
        name: `${prefix}-VISIBLE-COLOR`,
        description: 'Validation visible color',
        isVisible: true,
        isActive: true,
    });
    const hiddenColor = await createColor({
        name: `${prefix}-HIDDEN-COLOR`,
        description: 'Validation hidden color',
        isVisible: false,
        isActive: true,
    });

    const functionOut = await createFunction({
        code: `${prefix}-OUT`,
        name: `${prefix} OUT`,
        description: 'Validation OUT function',
        channelType: 'OUT',
        isActive: true,
        sortOrder: 9001,
    });
    const functionIn = await createFunction({
        code: `${prefix}-IN`,
        name: `${prefix} IN`,
        description: 'Validation IN function',
        channelType: 'IN',
        isActive: true,
        sortOrder: 9002,
    });
    const functionMissing = await createFunction({
        code: `${prefix}-MISSING`,
        name: `${prefix} Missing`,
        description: 'Validation missing mapping function',
        channelType: 'GENERAL',
        isActive: true,
        sortOrder: 9003,
    });

    const out16 = await createProduct({
        code: `${prefix}-OUT16`,
        name: `${prefix} OUT 16`,
        description: 'Validation OUT 16-channel module',
        unitPriceEurExVat: 100,
        isActive: true,
    });
    const out8 = await createProduct({
        code: `${prefix}-OUT8`,
        name: `${prefix} OUT 8`,
        description: 'Validation OUT 8-channel module',
        unitPriceEurExVat: 70,
        isActive: true,
    });
    const out4 = await createProduct({
        code: `${prefix}-OUT4`,
        name: `${prefix} OUT 4`,
        description: 'Validation OUT 4-channel module',
        unitPriceEurExVat: 45,
        isActive: true,
    });
    const in4 = await createProduct({
        code: `${prefix}-IN4`,
        name: `${prefix} IN 4`,
        description: 'Validation IN 4-channel module',
        unitPriceEurExVat: 30,
        isActive: true,
    });
    const hiddenOut8 = await createProduct({
        code: `${prefix}-HIDDEN-OUT8`,
        name: `${prefix} Hidden OUT 8`,
        description: 'Validation hidden OUT 8-channel module',
        unitPriceEurExVat: 80,
        isActive: true,
    });

    await ProductRangeProduct.bulkCreate([
        { productId: out16.id, productRangeId: visibleRange.id },
        { productId: out8.id, productRangeId: visibleRange.id },
        { productId: out4.id, productRangeId: visibleRange.id },
        { productId: in4.id, productRangeId: visibleRange.id },
        { productId: hiddenOut8.id, productRangeId: hiddenRange.id },
    ]);
    await ProductColorProduct.bulkCreate([
        { productId: out16.id, colorId: visibleColor.id },
        { productId: out8.id, colorId: visibleColor.id },
        { productId: out4.id, colorId: visibleColor.id },
        { productId: in4.id, colorId: visibleColor.id },
        { productId: hiddenOut8.id, colorId: hiddenColor.id },
    ]);

    await ProductFunctionMapping.bulkCreate([
        {
            productId: out16.id,
            smartFunctionId: functionOut.id,
            channelType: 'OUT',
            capacity: 16,
            priority: 30,
            calculationScope: 'level',
            isActive: true,
        },
        {
            productId: out8.id,
            smartFunctionId: functionOut.id,
            channelType: 'OUT',
            capacity: 8,
            priority: 20,
            calculationScope: 'level',
            isActive: true,
        },
        {
            productId: out4.id,
            smartFunctionId: functionOut.id,
            channelType: 'OUT',
            capacity: 4,
            priority: 10,
            calculationScope: 'level',
            isActive: true,
        },
        {
            productId: in4.id,
            smartFunctionId: functionIn.id,
            channelType: 'IN',
            capacity: 4,
            priority: 10,
            calculationScope: 'room',
            isActive: true,
        },
        {
            productId: hiddenOut8.id,
            smartFunctionId: functionOut.id,
            channelType: 'OUT',
            capacity: 8,
            priority: 50,
            calculationScope: 'level',
            isActive: true,
        },
    ]);

    const roomService = await createService({
        code: `${prefix}-ROOM-SERVICE`,
        name: `${prefix} Room Service`,
        description: 'Validation per-room service',
        pricingMode: 'per_room',
        unitPriceEurExVat: 20,
        isOptionalForCustomer: true,
        isActive: true,
    });
    await ServiceSmartFunction.create({
        serviceId: roomService.id,
        smartFunctionId: functionIn.id,
    });

    return {
        visibleRange,
        hiddenRange,
        visibleColor,
        hiddenColor,
        functionOut,
        functionIn,
        functionMissing,
        out8,
        roomService,
    };
}

function buildLevelPayload(functionsByRoom) {
    return [
        {
            id: `${prefix}-LEVEL-1`,
            name: 'Validation Level',
            rooms: functionsByRoom.map((functions, index) => ({
                id: `${prefix}-ROOM-${index + 1}`,
                name: `Validation Room ${index + 1}`,
                roomCount: 1,
                functionSelections: functions,
            })),
        },
    ];
}

async function validateScenarioA(data) {
    const calculation = await calculationService.calculateOffer({
        levels: buildLevelPayload([
            [{ smartFunctionId: data.functionOut.id, quantity: 5 }],
        ]),
        selectedRangeId: data.visibleRange.id,
        selectedColorId: data.visibleColor.id,
        multiplicationIndex: 1,
        selectedServiceIds: [],
        language: 'en',
    });

    assert(calculation.products.length === 1, 'Scenario A should allocate a single product line');
    assert(calculation.products[0].code === data.out8.code, 'Scenario A should round the 5-channel remainder to the 8-channel module');
    assert(calculation.products[0].quantity === 1, 'Scenario A should allocate exactly one 8-channel module');
    assert(roundMoney(calculation.productsSubtotalPerProject) === 70, 'Scenario A products subtotal per project should be 70.00');
    assert(roundMoney(calculation.totalPerProject) === 70, 'Scenario A total per project should be 70.00');
    assert(roundMoney(calculation.grossTotal) === 70, 'Scenario A gross total should stay at 70.00 for multiplier 1');
    assert(roundMoney(calculation.grandTotal) === 70, 'Scenario A grand total should stay at 70.00 for multiplier 1');
    assert(calculation.noCompatibleProducts === false, 'Scenario A should not report missing product compatibility');

    return calculation;
}

async function validateScenarioB(data) {
    const calculation = await calculationService.calculateOffer({
        levels: buildLevelPayload([
            [{ smartFunctionId: data.functionIn.id, quantity: 1 }],
            [{ smartFunctionId: data.functionIn.id, quantity: 1 }],
        ]),
        selectedRangeId: data.visibleRange.id,
        selectedColorId: data.visibleColor.id,
        multiplicationIndex: 5,
        selectedServiceIds: [data.roomService.id],
        language: 'en',
    });

    assert(calculation.products.length === 1, 'Scenario B should aggregate both room allocations into one IN product line');
    assert(calculation.products[0].quantity === 2, 'Scenario B should allocate one IN module per room');
    assert(roundMoney(calculation.productsSubtotalPerProject) === 60, 'Scenario B products subtotal per project should be 60.00');
    assert(roundMoney(calculation.servicesSubtotalPerProject) === 40, 'Scenario B services subtotal per project should be 40.00');
    assert(roundMoney(calculation.totalPerProject) === 100, 'Scenario B total per project should be 100.00');
    assert(roundMoney(calculation.grossTotal) === 500, 'Scenario B gross total should be 500.00 for multiplier 5');
    assert(roundMoney(calculation.discountPercent) === 5, 'Scenario B should apply the 5% multiplier discount rule');
    assert(roundMoney(calculation.discountAmount) === 25, 'Scenario B discount amount should be 25.00');
    assert(roundMoney(calculation.grandTotal) === 475, 'Scenario B grand total should be 475.00');

    return calculation;
}

async function validateScenarioC(data) {
    const visibleHiddenRange = await ProductRange.findAll({
        where: { isActive: true, isVisible: true, id: data.hiddenRange.id },
    });
    const visibleHiddenColor = await Color.findAll({
        where: { isActive: true, isVisible: true, id: data.hiddenColor.id },
    });

    assert(visibleHiddenRange.length === 0, 'Hidden range should not appear in customer-visible range queries');
    assert(visibleHiddenColor.length === 0, 'Hidden color should not appear in customer-visible color queries');

    const calculation = await calculationService.calculateOffer({
        levels: buildLevelPayload([
            [{ smartFunctionId: data.functionOut.id, quantity: 5 }],
        ]),
        selectedRangeId: data.hiddenRange.id,
        selectedColorId: data.hiddenColor.id,
        multiplicationIndex: 1,
        selectedServiceIds: [],
        language: 'en',
    });

    assert(calculation.products.length === 1, 'Scenario C should still calculate hidden/internal hardware correctly');
    assert(
        calculation.products[0].code === `${prefix}-HIDDEN-OUT8`,
        'Scenario C should use the hidden/internal mapping only for the explicitly selected hidden range/color'
    );

    return calculation;
}

async function validateScenarioD(data) {
    const calculation = await calculationService.calculateOffer({
        levels: buildLevelPayload([
            [{ smartFunctionId: data.functionMissing.id, quantity: 1 }],
        ]),
        selectedRangeId: data.visibleRange.id,
        selectedColorId: data.visibleColor.id,
        multiplicationIndex: 1,
        selectedServiceIds: [],
        language: 'en',
    });

    assert(calculation.products.length === 0, 'Scenario D should not invent product lines for unmapped functions');
    assert(calculation.unmetRequirementsCount > 0, 'Scenario D should report unmet requirements when mappings are missing');
    assert(calculation.noCompatibleProducts === true, 'Scenario D should flag missing compatibility for unmapped functions');

    return calculation;
}

async function validateStoredOfferAndExports(data, calculation) {
    let buildingType = await BuildingType.findOne({ where: { isActive: true }, order: [['createdAt', 'ASC']] });
    if (!buildingType) {
        buildingType = track('buildingTypeIds', await BuildingType.create({
            name: `${prefix}-BUILDING`,
            description: 'Validation building type',
            isActive: true,
        }));
    }

    const user = await createUser({
        email: `${prefix.toLowerCase()}@example.com`,
        passwordHash: 'validation-hash',
        role: 'customer',
        fullName: 'Validation Customer',
        isVerified: true,
        termsAccepted: true,
        cookiesAccepted: true,
        isActive: true,
    });
    const project = await createProject({
        userId: user.id,
        name: `${prefix} Project`,
        buildingTypeId: buildingType.id,
        builtUpArea: 120,
        levelsCount: 1,
        multiplicationIndex: 5,
        projectComplexity: 'medium',
        description: 'Validation project',
        selectedRangeId: data.visibleRange.id,
        selectedColorId: data.visibleColor.id,
        status: 'draft',
    });

    const offer = await offerService.createOffer(project.id, {
        levels: buildLevelPayload([
            [{ smartFunctionId: data.functionIn.id, quantity: 1 }],
            [{ smartFunctionId: data.functionIn.id, quantity: 1 }],
        ]),
        projectInfo: {
            name: project.name,
            buildingType: buildingType.id,
            buildingTypeName: buildingType.name,
            levelsCount: 1,
            area: project.builtUpArea,
            description: project.description,
            projectComplexity: project.projectComplexity,
            projectMultiplicationIndex: 5,
        },
        selectedRangeId: data.visibleRange.id,
        selectedColorId: data.visibleColor.id,
        multiplicationIndex: 5,
        selectedServiceIds: [data.roomService.id],
        customerComments: 'Validation offer comment',
        language: 'en',
        status: 'offer_ready',
    }, { id: user.id, role: 'customer' });
    created.offerIds.push(offer.id);

    assert(roundMoney(offer.grandTotal) === roundMoney(calculation.grandTotal), 'Stored offer grand total should match the main calculation engine');
    assert(
        roundMoney(offer.calculationSnapshot?.calculationBreakdown?.totalPerProject) === roundMoney(calculation.totalPerProject),
        'Stored offer calculation breakdown should keep the canonical per-project total'
    );
    assert(
        (offer.products || []).map((item) => item.productCode).join(',') === calculation.products.map((item) => item.code).join(','),
        'Stored offer product lines should match the calculation result'
    );

    const excelBuffer = await exportService.generateExcel(offer.id, { id: user.id, role: 'customer' });
    const pdfBuffer = await exportService.generatePdf(offer.id, { id: user.id, role: 'customer' });

    assert(Buffer.byteLength(Buffer.from(pdfBuffer)) > 1000, 'PDF export should generate a non-empty document');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(excelBuffer));
    const projectSheet = workbook.getWorksheet('Project Info') || workbook.worksheets[0];
    const summarySheet = workbook.getWorksheet('Calculation Summary') || workbook.worksheets[workbook.worksheets.length - 1];
    let foundMultiplier = false;
    let foundGrandTotal = false;

    projectSheet.eachRow((row) => {
        const values = Array.from({ length: row.cellCount }, (_, index) => row.getCell(index + 1).value);
        const normalized = values.map((value) => String(value ?? '').trim());
        if (normalized.includes('Multiplication Index') && normalized.includes('5')) {
            foundMultiplier = true;
        }
    });

    summarySheet.eachRow((row) => {
        const metric = String(row.getCell(1).value || '').trim().toUpperCase();
        const rawValue = row.getCell(2).value;
        const value = Number(typeof rawValue === 'object' && rawValue?.result != null ? rawValue.result : rawValue || 0);
        if (metric.startsWith('GRAND TOTAL') && roundMoney(value) === roundMoney(calculation.grandTotal)) {
            foundGrandTotal = true;
        }
    });

    assert(foundMultiplier, 'Excel export should include the stored multiplication index');
    assert(foundGrandTotal, 'Excel export should include the authoritative grand total from the stored offer');

    return offer;
}

async function main() {
    await sequelize.authenticate();

    const data = await createValidationData();
    const scenarioA = await validateScenarioA(data);
    const scenarioB = await validateScenarioB(data);
    const scenarioC = await validateScenarioC(data);
    const scenarioD = await validateScenarioD(data);
    const offer = await validateStoredOfferAndExports(data, scenarioB);

    console.log('Calculation validation passed.');
    console.log(JSON.stringify({
        scenarioA: {
            productsSubtotalPerProject: scenarioA.productsSubtotalPerProject,
            grandTotal: scenarioA.grandTotal,
            allocatedProduct: scenarioA.products[0]?.code || null,
        },
        scenarioB: {
            totalPerProject: scenarioB.totalPerProject,
            grossTotal: scenarioB.grossTotal,
            discountPercent: scenarioB.discountPercent,
            grandTotal: scenarioB.grandTotal,
        },
        scenarioC: {
            hiddenProduct: scenarioC.products[0]?.code || null,
            hiddenRangeVisiblePublicly: false,
            hiddenColorVisiblePublicly: false,
        },
        scenarioD: {
            unmetRequirementsCount: scenarioD.unmetRequirementsCount,
            noCompatibleProducts: scenarioD.noCompatibleProducts,
        },
        storedOffer: {
            offerId: offer.id,
            offerNumber: offer.offerNumber,
            grandTotal: offer.grandTotal,
        },
    }, null, 2));
}

main()
    .catch((error) => {
        console.error('Calculation validation failed:', error?.stack || error?.message || error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await cleanup();
        await sequelize.close().catch(() => {});
    });
