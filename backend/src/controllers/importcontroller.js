import * as importService from '../services/importservice.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

/**
 * Endpoint to download Excel templates
 */
export const downloadTemplate = async (req, res, next) => {
    try {
        const { type } = req.params;
        const validTypes = ['buildings', 'rooms', 'functions', 'devices'];
        if (!validTypes.includes(type)) {
            return sendError(res, 400, 'Invalid template type');
        }

        const buffer = await importService.generateTemplate(type);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${type}_template.xlsx`);
        return res.send(buffer);
    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint to process and import Excel data
 */
export const importExcel = async (req, res, next) => {
    try {
        const { type } = req.params;
        const file = req.file;

        if (!file) {
            return sendError(res, 400, 'No Excel file uploaded');
        }

        const validTypes = ['buildings', 'rooms', 'functions', 'devices'];
        if (!validTypes.includes(type)) {
            return sendError(res, 400, 'Invalid import type');
        }

        let result;
        if (type === 'buildings') {
            result = await importService.importBuildings(file.buffer);
        } else if (type === 'rooms') {
            result = await importService.importRooms(file.buffer);
        } else if (type === 'functions') {
            result = await importService.importFunctions(file.buffer);
        } else if (type === 'devices') {
            result = await importService.importDevices(file.buffer);
        }

        return sendResponse(res, 200, true, `${type.charAt(0).toUpperCase() + type.slice(1)} imported successfully`, result);
    } catch (error) {
        // Return clear, user-facing error details if it is a validation or parsing issue
        console.error(`Error importing ${type}:`, error);
        return sendError(res, 400, error.message || `Failed to import ${type}`);
    }
};
