import * as adminService from '../services/adminservice.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// Universal CRUD handler factory
const createCrudHandlers = (modelName, displayName) => ({
    getAll: async (req, res, next) => {
        try {
            const data = await adminService.getAll(modelName);
            sendResponse(res, 200, true, `${displayName} fetched`, data);
        } catch (error) {
            next(error);
        }
    },
    getOne: async (req, res, next) => {
        try {
            const data = await adminService.getById(modelName, req.params.id);
            if (!data) return sendError(res, 404, `${displayName} not found`);
            sendResponse(res, 200, true, `${displayName} fetched`, data);
        } catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const data = await adminService.create(modelName, req.body);
            sendResponse(res, 201, true, `${displayName} created`, data);
        } catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const data = await adminService.update(modelName, req.params.id, req.body);
            sendResponse(res, 200, true, `${displayName} updated`, data);
        } catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await adminService.remove(modelName, req.params.id);
            sendResponse(res, 200, true, `${displayName} deleted`);
        } catch (error) {
            next(error);
        }
    }
});

export const buildingTypeHandlers = createCrudHandlers('BuildingType', 'Building Type');
export const roomTypeHandlers = createCrudHandlers('RoomType', 'Room Type');
export const smartFunctionHandlers = createCrudHandlers('SmartFunction', 'Smart Function');
export const productRangeHandlers = createCrudHandlers('ProductRange', 'Product Range');
export const colorHandlers = createCrudHandlers('Color', 'Color');
export const productHandlers = createCrudHandlers('Product', 'Product');
export const productFunctionMappingHandlers = createCrudHandlers('ProductFunctionMapping', 'Product-Function Mapping');
export const serviceHandlers = createCrudHandlers('Service', 'Service');
export const discountRuleHandlers = createCrudHandlers('DiscountRule', 'Discount Rule');
export const offerConditionHandlers = createCrudHandlers('OfferCondition', 'Offer Condition');
export const disclaimerHandlers = createCrudHandlers('Disclaimer', 'Disclaimer');
export const followupTemplateHandlers = createCrudHandlers('FollowupTemplate', 'Follow-up Template');

export const getStats = async (req, res, next) => {
    try {
        const data = await adminService.getAdminStats();
        sendResponse(res, 200, true, 'Admin stats fetched', data);
    } catch (error) {
        next(error);
    }
};

export const employeeHandlers = {
    getAll: async (req, res, next) => {
        try {
            const data = await adminService.getEmployees();
            sendResponse(res, 200, true, 'Employees fetched', data);
        } catch (error) {
            next(error);
        }
    },
    getOne: async (req, res, next) => {
        try {
            const data = await adminService.getEmployeeById(req.params.id);
            if (!data) return sendError(res, 404, 'Employee not found');
            sendResponse(res, 200, true, 'Employee fetched', data);
        } catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const data = await adminService.createEmployee(req.body);
            sendResponse(res, 201, true, 'Employee created', data);
        } catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const data = await adminService.updateEmployee(req.params.id, req.body);
            sendResponse(res, 200, true, 'Employee updated', data);
        } catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            const data = await adminService.deleteEmployee(req.params.id);
            sendResponse(res, 200, true, 'Employee deleted', data);
        } catch (error) {
            next(error);
        }
    }
};

export const userHandlers = {
    getAll: async (_req, res, next) => {
        try {
            const data = await adminService.getUsers();
            sendResponse(res, 200, true, 'Users fetched', data);
        } catch (error) {
            next(error);
        }
    },
    getOne: async (req, res, next) => {
        try {
            const data = await adminService.getUserById(req.params.id);
            if (!data) return sendError(res, 404, 'User not found');
            sendResponse(res, 200, true, 'User fetched', data);
        } catch (error) {
            next(error);
        }
    },
};

// Harden Product list endpoint against inconsistent relations causing DB constraint errors.
productHandlers.getAll = async (req, res, next) => {
    try {
        try {
            const data = await adminService.getAll('Product');
            return sendResponse(res, 200, true, 'Product fetched', data);
        } catch (err) {
            if (err?.name === 'SequelizeForeignKeyConstraintError' || err?.name === 'SequelizeDatabaseError') {
                const data = await adminService.getAll('Product', { include: [] });
                return sendResponse(res, 200, true, 'Product fetched (with limited relations due to inconsistent data)', data);
            }
            throw err;
        }
    } catch (error) {
        next(error);
    }
};

export const syncProductRanges = async (req, res, next) => {
    try {
        const { rangeIds } = req.body;
        await adminService.syncRelations('Product', req.params.id, rangeIds, 'ProductRanges');
        sendResponse(res, 200, true, 'Product ranges synced for product');
    } catch (error) {
        next(error);
    }
};

export const syncProductColors = async (req, res, next) => {
    try {
        const { colorIds } = req.body;
        await adminService.syncRelations('Product', req.params.id, colorIds, 'Colors');
        sendResponse(res, 200, true, 'Colors synced for product');
    } catch (error) {
        next(error);
    }
};

export const syncServiceFunctions = async (req, res, next) => {
    try {
        const { functionIds } = req.body;
        await adminService.syncRelations('Service', req.params.id, functionIds, 'SmartFunctions');
        sendResponse(res, 200, true, 'Smart functions synced for service');
    } catch (error) {
        next(error);
    }
};

export const uploadRangeImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return sendError(res, 400, 'Image file is required');
        }

        const forwardedProto = typeof req.headers['x-forwarded-proto'] === 'string'
            ? req.headers['x-forwarded-proto'].split(',')[0]?.trim()
            : null;
        const protocol = forwardedProto || req.protocol || 'http';
        const host = req.get('host');
        const relativePath = `/uploads/ranges/${req.file.filename}`;
        const imageUrl = host ? `${protocol}://${host}${relativePath}` : relativePath;

        sendResponse(res, 201, true, 'Range image uploaded successfully', {
            imageUrl,
            filename: req.file.filename,
        });
    } catch (error) {
        next(error);
    }
};
