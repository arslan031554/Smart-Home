import { Router } from 'express';
import * as projectController from '../controllers/projectcontroller.js';
import protect from '../middlewares/authmiddleware.js';
import {
    projectValidator,
    levelValidator,
    roomValidator,
    functionSelectionValidator
} from '../validators/projectvalidator.js';

const router = Router();

router.use(protect);

// Project Routes
router.post('/', projectValidator, projectController.createProject);
router.get('/', projectController.getMyProjects);
router.get('/:id', projectController.getProjectDetails);
router.put('/:id', projectValidator, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Level Routes
router.post('/:id/levels', levelValidator, projectController.addLevel);
router.put('/:projectId/levels/:levelId', levelValidator, projectController.updateLevel);
router.delete('/:projectId/levels/:levelId', projectController.deleteLevel);

// Room Routes
router.post('/:id/rooms', roomValidator, projectController.addRoom);
router.put('/:projectId/rooms/:roomId', roomValidator, projectController.updateRoom);
router.delete('/:projectId/rooms/:roomId', projectController.deleteRoom);

// Function Selection Routes
router.post('/:projectId/rooms/:roomId/functions', functionSelectionValidator, projectController.addFunctionSelection);
router.put('/:projectId/rooms/:roomId/functions/:selectionId', functionSelectionValidator, projectController.updateFunctionSelection);
router.delete('/:projectId/rooms/:roomId/functions/:selectionId', projectController.deleteFunctionSelection);

export default router;
