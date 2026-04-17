export const BUILDING_TYPES = [
    { id: 'apartment', name: 'Apartment', icon: 'Home' },
    { id: 'villa', name: 'Villa / Detached House', icon: 'Building' },
    { id: 'office', name: 'Office Space', icon: 'Briefcase' },
    { id: 'commercial', name: 'Commercial Building', icon: 'Store' },
];

export const ROOM_TYPES = [
    { id: 'living_room', name: 'Living Room' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'bedroom', name: 'Bedroom' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'garage', name: 'Garage' },
    { id: 'outdoor', name: 'Outdoor / Garden' },
    { id: 'corridor', name: 'Corridor / Hallway' },
    { id: 'utility', name: 'Utility / Technical Room' },
];

export const SMART_FUNCTIONS = [
    { id: 'lighting', name: 'Lighting Control', icon: 'Zap', description: 'Smart switching and dimming' },
    { id: 'climate', name: 'Climate Control', icon: 'Thermometer', description: 'Heating and cooling automation' },
    { id: 'security', name: 'Security & Alarm', icon: 'Shield', description: 'Sensors and monitoring' },
    { id: 'audio_visual', name: 'Audio / Visual', icon: 'Tv', description: 'Multiroom audio and home cinema' },
    { id: 'blinds', name: 'Blind / Shutter Control', icon: 'Sun', description: 'Motorized shading' },
    { id: 'energy', name: 'Energy Management', icon: 'Battery', description: 'Power monitoring and optimization' },
];

export const SERVICES = [
    { id: 'programming', name: 'System Programming', price: 1500, description: 'Logic setup and scene configuration' },
    { id: 'installation', name: 'Hardware Installation', price: 2500, description: 'Physical setup of all smart components' },
    { id: 'maintenance', name: 'Premium Support (1 Year)', price: 500, description: 'Priority remote and onsite support' },
    { id: 'cloud', name: 'Cloud Integration', price: 300, description: 'Amazon Alexa, Google Home & Apple HomeKit' },
];
