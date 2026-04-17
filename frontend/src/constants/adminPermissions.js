export const ADMIN_PERMISSION_GROUPS = [
    {
        name: 'Core System Logic',
        permissions: [
            { id: 'view_master', label: 'View master data' },
            { id: 'edit_master', label: 'Edit master data' },
            { id: 'delete_master', label: 'Delete master data' },
        ],
    },
    {
        name: 'Commercial Operations',
        permissions: [
            { id: 'view_offers', label: 'View offers' },
            { id: 'edit_offers', label: 'Edit offers' },
            { id: 'delete_offers', label: 'Delete offers' },
        ],
    },
    {
        name: 'Hardware Ecosystem',
        permissions: [
            { id: 'view_hardware', label: 'View products and services' },
            { id: 'edit_hardware', label: 'Edit products and services' },
            { id: 'edit_pricing', label: 'Edit pricing' },
        ],
    },
    {
        name: 'Governance & Personnel',
        permissions: [
            { id: 'manage_employees', label: 'Manage employees and permissions' },
            { id: 'manage_rules', label: 'Manage discount/content/follow-up rules' },
        ],
    },
];

export const ADMIN_PERMISSION_IDS = ADMIN_PERMISSION_GROUPS.flatMap((group) => group.permissions.map((permission) => permission.id));

export function hasAdminAccess(user) {
    if (!user) return false;
    if (user.role === 'admin') return user.isActive !== false;
    if (user.role !== 'employee') return false;
    if (user.isActive === false) return false;
    return Array.isArray(user.permissions) && user.permissions.some((permission) => ADMIN_PERMISSION_IDS.includes(permission));
}

export function hasPermission(user, permission) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
}
