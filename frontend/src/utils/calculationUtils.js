/**
 * Smart Building Configurator — Advanced Calculation Engine
 * 
 * Data-driven calculation simulating complex hardware BOM generation 
 * based on admin-defined mappings, capacities, and prioritisation logic.
 */

/**
 * Greedy bin-packing: fill demand using modules largest-capacity or highest-priority first.
 */
function packModules(demand, skuList) {
    if (!demand || demand <= 0) return [];
    // Sort by capacity descending to minimize module count
    const sorted = [...skuList].sort((a, b) => {
        const capA = a.capacity || 1;
        const capB = b.capacity || 1;
        return capB - capA;
    });

    const result = [];
    let remaining = demand;

    for (const sku of sorted) {
        if (remaining <= 0) break;
        const qty = Math.ceil(remaining / sku.capacity);
        result.push({
            ...sku,
            qty,
            subtotal: qty * (sku.price || 0),
        });
        remaining = 0; // In this simplified packing, we take the best fit.
    }

    return result;
}

/**
 * Aggregate demand from the project configuration.
 */
export function aggregateFunctionDemand(levels) {
    const demands = {}; // Key: functionId__channelType
    let totalNodes = 0;
    let roomCount = 0;
    let levelCount = levels?.length || 0;

    levels?.forEach(level => {
        level.rooms?.forEach(room => {
            const qtyMultiplier = parseInt(room.roomCount ?? room.count, 10) || 1;
            totalNodes += qtyMultiplier;
            roomCount += qtyMultiplier;

            room.functions?.forEach(func => {
                const channel = func.channelType || 'IN';
                const key = `${func.id}__${channel}`;

                if (!demands[key]) {
                    demands[key] = {
                        functionId: func.id,
                        channelType: channel,
                        demand: 0,
                        roomsAffected: 0
                    };
                }

                const demandVal = (func.quantity || 1) * qtyMultiplier;
                demands[key].demand += demandVal;
                demands[key].roomsAffected += qtyMultiplier;
            });
        });
    });

    return { demands: Object.values(demands), totalNodes, roomCount, levelCount };
}

/**
 * Dynamic Hardware BOM Generator
 */
export function calculateHardwareInventory(levels, adminState, configuratorState = {}) {
    const { products } = adminState;
    const { demands, totalNodes, roomCount } = aggregateFunctionDemand(levels);

    const items = [];
    const rangeId = configuratorState.range || null;

    // 1. Process each aggregated demand
    demands.forEach(d => {
        // Find products that can fulfill this (functionId, channelType)
        const candidates = (products || []).filter(p => {
            const isActive = p.status === 'Active';
            const rangeMatch = !rangeId || !p.allowedRanges || p.allowedRanges.length === 0 || p.allowedRanges.includes(rangeId);
            if (!isActive || !rangeMatch) return false;

            const hasMapping = p.mappings?.some(m => m.functionId === d.functionId && m.channelType === d.channelType);
            return hasMapping;
        });

        if (candidates.length === 0) return;

        const mappedSkus = candidates.map(p => {
            const mapping = p.mappings.find(m => m.functionId === d.functionId && m.channelType === d.channelType);
            return {
                ...p,
                capacity: mapping.capacity || 1,
                priority: mapping.priority || 1,
                calculationScope: mapping.calculationScope || 'room'
            };
        });

        const packed = packModules(d.demand, mappedSkus);
        packed.forEach(item => {
            items.push({
                ...item,
                description: `Module for ${d.functionId} (${d.channelType}) control.`
            });
        });
    });

    // 2. Add Infrastructure
    const infrastructureProducts = products.filter(p => p.mappings?.some(m => m.calculationScope === 'project'));
    const controller = infrastructureProducts.find(p => p.code.includes('CTR') || p.name.includes('Controller'));
    if (controller && roomCount > 0) {
        items.push({ ...controller, qty: 1, subtotal: controller.price, description: 'Central Project Automation Hub' });
    }

    const psu = infrastructureProducts.find(p => p.code.includes('PWR') || p.name.includes('Power'));
    if (psu && totalNodes > 0) {
        const qty = Math.ceil(totalNodes / 16);
        items.push({ ...psu, qty, subtotal: qty * psu.price, description: 'Bus Power Infrastructure' });
    }

    const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    return { items, total, nodeCount: totalNodes, roomCount };
}

/**
 * Multi-mode Service Calculation
 */
export function calculateServices(selectedServices, hardwareBOM, summary) {
    let total = 0;
    const details = selectedServices?.map(s => {
        let qty = 1;
        if (s.type === 'per_room') qty = summary.roomCount;
        if (s.type === 'per_level') qty = summary.levelCount || 1;
        if (s.type === 'per_product_qty') qty = hardwareBOM.reduce((sum, item) => sum + item.qty, 0);

        const subtotal = (s.price || 0) * qty;
        total += subtotal;

        return { ...s, calcQty: qty, subtotal };
    }) || [];

    return { details, total };
}

/**
 * Canonical Finance Engine
 */
export function calculateFinances({ levels, adminState, configuratorState }) {
    if (!levels || !adminState || !configuratorState) return null;

    const units = parseInt(configuratorState.projectInfo?.projectMultiplicationIndex ?? configuratorState.projectMultiplicationIndex, 10) || 1;

    // 1. Hardware
    const hardwareSummary = calculateHardwareInventory(levels, adminState, configuratorState);

    // 2. Multipliers
    // On public configurator we only load `publicProductRanges`, while in admin
    // we use `productRanges`. Prefer full admin ranges when present, otherwise
    // fall back to the public set so range pricing still works for guests.
    const allRanges =
        (Array.isArray(adminState.productRanges) && adminState.productRanges.length > 0)
            ? adminState.productRanges
            : (adminState.publicProductRanges || []);

    const range = allRanges.find(r => r.id === configuratorState.range);
    const rangeMult = range?.priceMultiplier || 1.0;

    const hardwareTotalRaw = hardwareSummary.total;
    const hardwarePerUnit = hardwareTotalRaw * rangeMult;
    const grossHardware = hardwarePerUnit * units;

    // 3. Services (Resolve full objects from IDs)
    const selectedServiceIds = configuratorState.services || [];
    const activeServices = (adminState.services || []).filter(s => selectedServiceIds.includes(s.id));

    // We need levelCount for service calc
    const serviceSummary = {
        roomCount: hardwareSummary.roomCount,
        levelCount: levels.length
    };

    const serviceResults = calculateServices(activeServices, hardwareSummary.items, serviceSummary);
    const servicesTotalOnce = serviceResults.total;

    // 4. Grand Totals
    const grossTotal = grossHardware + servicesTotalOnce;

    // 5. Discounts
    const discountRules = adminState.discounts || [];
    const discountRule = discountRules.find(r => units >= (r.minMultiplier ?? 0) && units <= (r.maxMultiplier ?? 999999));
    const discountPercent = discountRule ? (discountRule.discountPercent || 0) : 0;
    const discountAmount = grossHardware * (discountPercent / 100);

    const grandTotal = grossTotal - discountAmount;

    return {
        units,
        hardwareSummary,
        serviceResults,
        hardwarePerUnit,
        hardwareTotal: grossHardware,
        servicesTotal: servicesTotalOnce,
        grossTotal,
        discountPercent,
        discountAmount,
        grandTotal,
        rangeName: range?.name || 'Standard',
        rangeMultiplier: rangeMult
    };
}

/**
 * Functions Summary for UI
 */
export function aggregateFunctionsForSummary(levels) {
    const funcMap = {};

    levels?.forEach(level => {
        level.rooms?.forEach(room => {
            const roomCount = parseInt(room.roomCount ?? room.count, 10) || 1;
            room.functions?.forEach(func => {
                const key = func.id;
                if (!funcMap[key]) {
                    funcMap[key] = {
                        ...func,
                        totalQty: 0,
                        rooms: [],
                    };
                }
                const qty = (func.quantity || 1) * roomCount;
                funcMap[key].totalQty += qty;

                // Track which rooms have this function
                const existingRoom = funcMap[key].rooms.find(r => r.roomName === room.name && r.levelName === level.name);
                if (existingRoom) {
                    existingRoom.qty += qty;
                } else {
                    funcMap[key].rooms.push({
                        roomName: room.name,
                        levelName: level.name,
                        qty,
                    });
                }
            });
        });
    });

    return Object.values(funcMap).filter(f => f.totalQty > 0);
}

