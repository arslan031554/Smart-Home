import * as projectService from '../services/projectservice.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

const resolveProjectScopeUserId = (user) => (
    user?.role === 'admin' ? null : user?.id
);

export const createProject = async (req, res, next) => {
    try {
        const project = await projectService.createProject(req.user.id, req.body);
        sendResponse(res, 201, true, 'Project created', project);
    } catch (error) {
        next(error);
    }
};

export const getMyProjects = async (req, res, next) => {
    try {
        const projects = await projectService.getMyProjects(resolveProjectScopeUserId(req.user));
        sendResponse(res, 200, true, 'Projects fetched', projects);
    } catch (error) {
        next(error);
    }
};

export const getProjectDetails = async (req, res, next) => {
    try {
        const project = await projectService.getProjectDetails(resolveProjectScopeUserId(req.user), req.params.id);
        if (!project) return sendError(res, 404, 'Project not found');
        sendResponse(res, 200, true, 'Project details fetched', project);
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (req, res, next) => {
    try {
        const project = await projectService.updateProject(resolveProjectScopeUserId(req.user), req.params.id, req.body);
        sendResponse(res, 200, true, 'Project updated', project);
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req, res, next) => {
    try {
        await projectService.deleteProject(resolveProjectScopeUserId(req.user), req.params.id);
        sendResponse(res, 200, true, 'Project deleted');
    } catch (error) {
        next(error);
    }
};

// Level Handlers (ownership enforced via userId)
export const addLevel = async (req, res, next) => {
    try {
        const level = await projectService.addLevel(req.params.id, req.body, resolveProjectScopeUserId(req.user));
        sendResponse(res, 201, true, 'Level added', level);
    } catch (error) {
        next(error);
    }
};

export const updateLevel = async (req, res, next) => {
    try {
        const level = await projectService.updateLevel(req.params.levelId, req.body, resolveProjectScopeUserId(req.user));
        sendResponse(res, 200, true, 'Level updated', level);
    } catch (error) {
        next(error);
    }
};

export const deleteLevel = async (req, res, next) => {
    try {
        await projectService.deleteLevel(req.params.levelId, resolveProjectScopeUserId(req.user));
        sendResponse(res, 200, true, 'Level deleted');
    } catch (error) {
        next(error);
    }
};

// Room Handlers (POST /projects/:id/rooms — :id is projectId; send projectLevelId in body)
export const addRoom = async (req, res, next) => {
    try {
        const projectLevelId = req.body.projectLevelId;
        if (!projectLevelId) return sendError(res, 400, 'projectLevelId is required in body');
        const room = await projectService.addRoom(projectLevelId, req.body, resolveProjectScopeUserId(req.user));
        sendResponse(res, 201, true, 'Room added', room);
    } catch (error) {
        next(error);
    }
};

export const updateRoom = async (req, res, next) => {
    try {
        const room = await projectService.updateRoom(req.params.roomId, req.body, resolveProjectScopeUserId(req.user));
        sendResponse(res, 200, true, 'Room updated', room);
    } catch (error) {
        next(error);
    }
};

export const deleteRoom = async (req, res, next) => {
    try {
        await projectService.deleteRoom(req.params.roomId, resolveProjectScopeUserId(req.user));
        sendResponse(res, 200, true, 'Room deleted');
    } catch (error) {
        next(error);
    }
};

// Function Selection Handlers
export const addFunctionSelection = async (req, res, next) => {
    try {
        const selection = await projectService.addFunctionSelection(req.params.roomId, req.body, resolveProjectScopeUserId(req.user));
        sendResponse(res, 201, true, 'Function selection added', selection);
    } catch (error) {
        next(error);
    }
};

export const updateFunctionSelection = async (req, res, next) => {
    try {
        const selection = await projectService.updateFunctionSelection(req.params.selectionId, req.body, resolveProjectScopeUserId(req.user));
        sendResponse(res, 200, true, 'Function selection updated', selection);
    } catch (error) {
        next(error);
    }
};

export const deleteFunctionSelection = async (req, res, next) => {
    try {
        await projectService.deleteFunctionSelection(req.params.selectionId, resolveProjectScopeUserId(req.user));
        sendResponse(res, 200, true, 'Function selection deleted');
    } catch (error) {
        next(error);
    }
};
