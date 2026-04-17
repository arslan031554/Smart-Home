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

export const ALL_ADMIN_PERMISSIONS = ADMIN_PERMISSION_GROUPS.flatMap((group) =>
    group.permissions.map((permission) => permission.id)
);

export const EMPLOYEE_ROLE_DEFAULT_PERMISSIONS = {
    Administrator: ALL_ADMIN_PERMISSIONS,
    Engineer: ['view_master', 'edit_master', 'view_offers', 'view_hardware', 'edit_hardware'],
    'Technical Sales': ['view_master', 'view_offers', 'edit_offers', 'view_hardware', 'manage_rules'],
    'Maintenance Lead': ['view_hardware'],
};

export function normalizePermissions(input) {
    const source = Array.isArray(input) ? input : [];
    const unique = new Set();

    for (const permission of source) {
        const rawPermission = typeof permission === 'string'
            ? permission
            : (permission && typeof permission === 'object' ? permission.id : '');
        const normalized = typeof rawPermission === 'string' ? rawPermission.trim() : '';
        if (normalized && ALL_ADMIN_PERMISSIONS.includes(normalized)) {
            unique.add(normalized);
        }
    }

    return Array.from(unique);
}

export function getDefaultPermissionsForEmployeeRole(employeeRole) {
    return normalizePermissions(EMPLOYEE_ROLE_DEFAULT_PERMISSIONS[employeeRole] || []);
}

export function hasAdminPanelAccess(user) {
    if (!user) return false;
    if (user.role === 'admin') return user.isActive !== false;
    if (user.role !== 'employee') return false;
    if (user.isActive === false) return false;
    return normalizePermissions(user.permissions).length > 0;
}

export function hasAdminPermission(user, permission) {
    if (!permission) return hasAdminPanelAccess(user);
    if (!user) return false;
    if (user.role === 'admin') return user.isActive !== false;
    if (user.role !== 'employee' || user.isActive === false) return false;
    return normalizePermissions(user.permissions).includes(permission);
}
