/**
 * Master data for Smart Home Configurator.
 * Source: client requirements + existing app context.
 * Values marked PROVISIONAL in SEED_ASSUMPTIONS.md are defaults for testing only.
 */

export const buildingTypes = [
    { name: 'House', description: 'Single-family house' },
    { name: 'Apartment', description: 'Apartment or flat' },
    { name: 'Villa', description: 'Villa or large residence' },
    { name: 'Office', description: 'Office building' },
    { name: 'Commercial', description: 'Commercial space' },
];

export const roomTypes = [
    { name: 'Living Room' },
    { name: 'Bedroom' },
    { name: 'Kitchen' },
    { name: 'Bathroom' },
    { name: 'Hallway' },
    { name: 'Office' },
    { name: 'Dining Room' },
    { name: 'Garage' },
    { name: 'Basement' },
    { name: 'Terrace' },
];

export const smartFunctions = [
    { code: 'LIGHT', name: 'Lighting', channelType: 'IN', sortOrder: 1, icon: 'Sun' },
    { code: 'CLIMATE', name: 'Climate / HVAC', channelType: 'IN', sortOrder: 2, icon: 'Thermometer' },
    { code: 'SECURITY', name: 'Security', channelType: 'GENERAL', sortOrder: 3, icon: 'Shield' },
    { code: 'AV', name: 'Audio / Video', channelType: 'IN', sortOrder: 4, icon: 'Monitor' },
    { code: 'SHADING', name: 'Shading & Blinds', channelType: 'OUT', sortOrder: 5, icon: 'Layers' },
    { code: 'ENERGY', name: 'Energy Monitoring', channelType: 'GENERAL', sortOrder: 6, icon: 'Zap' },
    { code: 'ACCESS', name: 'Access Control', channelType: 'GENERAL', sortOrder: 7, icon: 'Key' },
    { code: 'VIDEO', name: 'Video Doorbell / Cameras', channelType: 'GENERAL', sortOrder: 8, icon: 'Camera' },
];

export const productRanges = [
    { name: 'Standard', description: 'Standard range for residential use' },
    { name: 'Premium', description: 'Premium range with extended features' },
    { name: 'Essential', description: 'Essential entry-level range' },
];

export const colors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#1F2937' },
    { name: 'Anthracite', hex: '#343A40' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Aluminium', hex: '#D6D6D6' },
];

export const offerConditions = [
    { text: 'This offer is valid for 30 days from the date of issue.', order: 1 },
    { text: 'Prices are excluding VAT unless otherwise stated.', order: 2 },
    { text: 'Installation and commissioning may be quoted separately.', order: 3 },
];

export const disclaimers = [
    { text: 'Technical specifications are subject to change. Final product may vary.', order: 1 },
    { text: 'Smart home systems require compatible network and power infrastructure.', order: 2 },
];

/** Provisional: sample discount tiers for testing. Replace with client rules. */
export const discountRules = [
    { minMultiplier: 1, maxMultiplier: 4, discountPercent: 0 },
    { minMultiplier: 5, maxMultiplier: 9, discountPercent: 5 },
    { minMultiplier: 10, maxMultiplier: 999, discountPercent: 10 },
];

/** Provisional: sample products for testing. Codes and prices are placeholders. */
export const products = [
    { code: 'SW-LIGHT-01', name: 'Smart Switch 1-gang', unitPriceEurExVat: 49.99 },
    { code: 'SW-LIGHT-02', name: 'Smart Switch 2-gang', unitPriceEurExVat: 59.99 },
    { code: 'TH-CLIM-01', name: 'Room Thermostat', unitPriceEurExVat: 129.00 },
    { code: 'SEN-PIR-01', name: 'PIR Motion Sensor', unitPriceEurExVat: 39.99 },
];

/** Provisional: sample services for testing. */
export const services = [
    { code: 'INSTALL', name: 'Installation', pricingMode: 'fixed_project', unitPriceEurExVat: 299 },
    { code: 'CONFIG', name: 'Configuration', pricingMode: 'per_room', unitPriceEurExVat: 49 },
];
