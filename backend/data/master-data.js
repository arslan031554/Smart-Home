/**
 * Master data for Smart Building Configurator.
 * Source: client requirements + existing app context.
 * Values marked PROVISIONAL in SEED_ASSUMPTIONS.md are defaults for testing only.
 */

export const buildingTypes = [
    {
        name: 'Apartment',
        description: 'Apartment projects, including repeated flats within larger residential blocks.',
    },
    {
        name: 'Single-family House',
        description: 'Detached or semi-detached single-family house projects.',
        aliases: ['House', 'Villa'],
    },
    {
        name: 'Commercial',
        description: 'Commercial, retail, warehouse, and production spaces.',
    },
    {
        name: 'Office Space',
        description: 'Office workplace projects, from single offices to larger business floors.',
        aliases: ['Office'],
    },
    {
        name: 'Hotel',
        description: 'Hotel and hospitality projects, including guestrooms and shared amenity areas.',
    },
];

export const roomTypes = [
    { name: 'Living Room', description: 'Main residential living area.', buildingTypes: ['Apartment', 'Single-family House'] },
    { name: 'Kitchen', description: 'Dedicated cooking and food preparation area.', buildingTypes: ['Apartment', 'Single-family House', 'Hotel'] },
    { name: 'Living Room + Kitchen', description: 'Open-plan combined living and kitchen space.', buildingTypes: ['Apartment', 'Single-family House'] },
    { name: 'Personal Office', description: 'Private study or work room.', buildingTypes: ['Apartment', 'Single-family House'] },
    { name: 'Bedroom', description: 'Residential sleeping room.', buildingTypes: ['Apartment', 'Single-family House'] },
    { name: 'Full Bathroom', description: 'Full residential bathroom.', buildingTypes: ['Apartment', 'Single-family House'] },
    { name: 'Service Bathroom', description: 'Service bathroom or guest WC.', buildingTypes: ['Apartment', 'Single-family House'] },
    { name: 'Dressing', description: 'Walk-in wardrobe or dressing room.', buildingTypes: ['Apartment', 'Single-family House'] },
    { name: 'Storage', description: 'General residential storage room.', buildingTypes: ['Apartment', 'Single-family House'] },
    { name: 'Technical Room', description: 'Technical or plant room.', buildingTypes: ['Apartment', 'Single-family House', 'Commercial', 'Office Space', 'Hotel'] },
    { name: 'Lobby', description: 'Shared arrival or circulation space.', buildingTypes: ['Apartment', 'Single-family House', 'Commercial', 'Office Space', 'Hotel'] },
    { name: 'Hall', description: 'Internal hall or circulation area.', buildingTypes: ['Apartment', 'Single-family House', 'Office Space', 'Hotel'] },
    { name: 'Multifunctional Space', description: 'Flexible multipurpose room.', buildingTypes: ['Apartment', 'Single-family House', 'Commercial'] },
    { name: 'Staircase', description: 'Stair or stair landing area.', buildingTypes: ['Apartment', 'Single-family House', 'Hotel'] },
    { name: 'Garage', description: 'Garage or enclosed vehicle space.', buildingTypes: ['Apartment', 'Single-family House'] },
    { name: 'Cinema', description: 'Home cinema or media room.', buildingTypes: ['Single-family House'] },
    { name: 'Indoor Swimming Pool', description: 'Indoor pool area.', buildingTypes: ['Single-family House', 'Hotel'] },
    { name: 'Sauna', description: 'Sauna or wellness room.', buildingTypes: ['Single-family House', 'Hotel'] },
    { name: 'Hammam', description: 'Steam room / hammam.', buildingTypes: ['Single-family House', 'Hotel'] },
    { name: 'Jacuzzi', description: 'Jacuzzi or spa zone.', buildingTypes: ['Single-family House', 'Hotel'] },
    { name: 'Locker Room', description: 'Changing room with lockers.', buildingTypes: ['Single-family House', 'Commercial', 'Hotel'] },
    { name: 'Warehouse < 5m', description: 'Warehouse with height below 5 meters.', buildingTypes: ['Commercial'] },
    { name: 'Warehouse > 5m', description: 'Warehouse with height above 5 meters.', buildingTypes: ['Commercial'] },
    { name: 'Production Space < 5m', description: 'Production space with height below 5 meters.', buildingTypes: ['Commercial'] },
    { name: 'Production Space > 5m', description: 'Production space with height above 5 meters.', buildingTypes: ['Commercial'] },
    { name: 'Individual Office', description: 'Single-person office.', buildingTypes: ['Commercial', 'Office Space'] },
    { name: 'Multi-person Office', description: 'Shared office workspace.', buildingTypes: ['Commercial', 'Office Space'] },
    { name: 'Meeting Room', description: 'Small or medium collaboration room.', buildingTypes: ['Commercial', 'Office Space', 'Hotel'] },
    { name: 'Conference Room', description: 'Large conference or board room.', buildingTypes: ['Office Space', 'Hotel'] },
    { name: 'Reception', description: 'Reception or welcome desk area.', buildingTypes: ['Commercial', 'Office Space', 'Hotel'] },
    { name: 'Kitchenette', description: 'Compact staff or service kitchenette.', buildingTypes: ['Commercial', 'Office Space', 'Hotel'] },
    { name: 'Storage Space', description: 'Operational storage space.', buildingTypes: ['Commercial', 'Office Space', 'Hotel'] },
    { name: 'Technical Space', description: 'Operational technical service space.', buildingTypes: ['Commercial', 'Office Space', 'Hotel'] },
    { name: 'Single Room', description: 'Single guest room.', buildingTypes: ['Hotel'] },
    { name: 'Double Room', description: 'Double guest room.', buildingTypes: ['Hotel'] },
    { name: 'Suite', description: 'Suite or premium guest room.', buildingTypes: ['Hotel'] },
    { name: 'Hotel Bathroom', description: 'Guestroom bathroom.', buildingTypes: ['Hotel'] },
    { name: 'Green Space', description: 'Garden or landscaped outdoor area.', buildingTypes: ['Apartment', 'Single-family House', 'Commercial', 'Hotel'] },
    { name: 'Terrace', description: 'Terrace or outdoor platform.', buildingTypes: ['Apartment', 'Single-family House', 'Hotel'] },
    { name: 'Gazebo / Barbecue', description: 'Outdoor gazebo or barbecue area.', buildingTypes: ['Single-family House', 'Hotel'] },
    { name: 'Pool', description: 'Outdoor pool area.', buildingTypes: ['Single-family House', 'Hotel'] },
    { name: 'Other', description: 'Fallback space for client-specific room types.', buildingTypes: ['Apartment', 'Single-family House', 'Commercial', 'Office Space', 'Hotel'] },
];

export const smartFunctions = [
    { code: 'LIGHT', name: 'Lighting', channelType: 'IN', inputChannelCount: 1, outputChannelCount: 0, generalChannelCount: 0, sortOrder: 1, icon: 'Sun' },
    { code: 'CLIMATE', name: 'Climate / HVAC', channelType: 'IN', inputChannelCount: 1, outputChannelCount: 0, generalChannelCount: 0, sortOrder: 2, icon: 'Thermometer' },
    { code: 'SECURITY', name: 'Security', channelType: 'GENERAL', inputChannelCount: 0, outputChannelCount: 0, generalChannelCount: 1, sortOrder: 3, icon: 'Shield' },
    { code: 'AV', name: 'Audio / Video', channelType: 'IN', inputChannelCount: 1, outputChannelCount: 0, generalChannelCount: 0, sortOrder: 4, icon: 'Monitor' },
    { code: 'SHADING', name: 'Shading & Blinds', channelType: 'OUT', inputChannelCount: 0, outputChannelCount: 1, generalChannelCount: 0, sortOrder: 5, icon: 'Layers' },
    { code: 'ENERGY', name: 'Energy Monitoring', channelType: 'GENERAL', inputChannelCount: 0, outputChannelCount: 0, generalChannelCount: 1, sortOrder: 6, icon: 'Zap' },
    { code: 'ACCESS', name: 'Access Control', channelType: 'GENERAL', inputChannelCount: 0, outputChannelCount: 0, generalChannelCount: 1, sortOrder: 7, icon: 'Key' },
    { code: 'VIDEO', name: 'Video Doorbell / Cameras', channelType: 'GENERAL', inputChannelCount: 0, outputChannelCount: 0, generalChannelCount: 1, sortOrder: 8, icon: 'Camera' },
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
