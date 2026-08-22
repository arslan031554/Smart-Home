import Project from '../../models/Project.js';
import ProjectLevel from '../../models/ProjectLevel.js';
import ProjectRoom from '../../models/ProjectRoom.js';
import RoomFunctionSelection from '../../models/RoomFunctionSelection.js';
import RoomType from '../../models/RoomType.js';
import SmartFunction from '../../models/SmartFunction.js';
import BuildingType from '../../models/BuildingType.js';
import { Op } from 'sequelize';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalizeNullableString = (value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const normalized = String(value).trim();
    return normalized ? normalized : null;
};

const normalizeNullableUuid = (value) => {
    const normalized = normalizeNullableString(value);
    return normalized && UUID_REGEX.test(normalized) ? normalized : null;
};

const normalizePositiveFloat = (value, fallback = 1) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizePositiveInt = (value, fallback = 1) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeWorkspaceLevels = (levels = []) => (
    Array.isArray(levels)
        ? levels.map((level, levelOrder) => ({
            name: normalizeNullableString(level?.name) || `Level ${levelOrder + 1}`,
            levelOrder,
            rooms: Array.isArray(level?.rooms)
                ? level.rooms.map((room) => ({
                    roomTypeId: normalizeNullableUuid(room?.roomTypeId ?? room?.type),
                    name: normalizeNullableString(room?.name) || 'Room',
                    roomCount: normalizePositiveInt(room?.roomCount ?? room?.count, 1),
                    functionSelections: Array.isArray(room?.functionSelections || room?.functions)
                        ? (room.functionSelections || room.functions).map((selection) => ({
                            smartFunctionId: normalizeNullableUuid(selection?.smartFunctionId ?? selection?.id),
                            quantity: normalizePositiveInt(selection?.quantity, 1),
                        })).filter((selection) => selection.smartFunctionId)
                        : [],
                })).filter((room) => room.roomTypeId)
                : [],
        }))
        : []
);

const normalizeProjectPayload = (projectData = {}) => {
    const payload = {};

    if (projectData.name !== undefined) payload.name = normalizeNullableString(projectData.name);
    if (projectData.buildingTypeId !== undefined || projectData.buildingType !== undefined) {
        payload.buildingTypeId = normalizeNullableUuid(projectData.buildingTypeId ?? projectData.buildingType);
    }
    if (projectData.builtUpArea !== undefined || projectData.area !== undefined) {
        payload.builtUpArea = normalizePositiveFloat(projectData.builtUpArea ?? projectData.area, 0);
    }
    if (projectData.levelsCount !== undefined) {
        payload.levelsCount = normalizePositiveInt(projectData.levelsCount, 1);
    }
    if (projectData.multiplicationIndex !== undefined || projectData.projectMultiplicationIndex !== undefined) {
        payload.multiplicationIndex = normalizePositiveFloat(projectData.multiplicationIndex ?? projectData.projectMultiplicationIndex, 1);
    }
    if (projectData.projectComplexity !== undefined) {
        payload.projectComplexity = normalizeNullableString(projectData.projectComplexity);
    }
    if (projectData.description !== undefined) {
        payload.description = normalizeNullableString(projectData.description);
    }
    if (projectData.selectedRangeId !== undefined) {
        payload.selectedRangeId = normalizeNullableUuid(projectData.selectedRangeId);
    }
    if (projectData.selectedColorId !== undefined) {
        payload.selectedColorId = normalizeNullableUuid(projectData.selectedColorId);
    }
    if (projectData.status !== undefined && ['draft', 'active', 'archived'].includes(projectData.status)) {
        payload.status = projectData.status;
    }

    return payload;
};

const createNotFoundError = (entityName) => {
    const error = new Error(`${entityName} not found`);
    error.statusCode = 404;
    return error;
};

export const dedupeProjectsById = (projects = []) => {
    const seen = new Set();
    return projects.filter((project) => {
        const id = project?.id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

async function ensureProjectOwnership(projectId, userId, transaction = undefined) {
    if (!userId) return;
    const project = await Project.findByPk(projectId, { attributes: ['id', 'userId'], transaction });
    if (!project || project.userId !== userId) throw createNotFoundError('Project');
}

async function ensureLevelOwnership(levelId, userId) {
    if (!userId) return;
    const level = await ProjectLevel.findByPk(levelId, { include: [{ model: Project, as: 'project', attributes: ['userId'] }] });
    if (!level?.project || level.project.userId !== userId) throw createNotFoundError('Level');
}

async function ensureRoomOwnership(roomId, userId) {
    if (!userId) return;
    const room = await ProjectRoom.findByPk(roomId, { include: [{ model: ProjectLevel, as: 'level', include: [{ model: Project, as: 'project', attributes: ['userId'] }] }] });
    if (!room?.level?.project || room.level.project.userId !== userId) throw createNotFoundError('Room');
}

async function ensureSelectionOwnership(selectionId, userId) {
    if (!userId) return;
    const sel = await RoomFunctionSelection.findByPk(selectionId, {
        include: [{ model: ProjectRoom, as: 'room', include: [{ model: ProjectLevel, as: 'level', include: [{ model: Project, as: 'project', attributes: ['userId'] }] }] }]
    });
    if (!sel?.room?.level?.project || sel.room.level.project.userId !== userId) throw createNotFoundError('Selection');
}

export const createProject = async (userId, projectData) => {
    return await Project.create({ ...normalizeProjectPayload(projectData), userId });
};

export const findRecentMatchingProject = async (userId, projectData = {}, recentMs = 120000) => {
    const normalized = normalizeProjectPayload(projectData);
    const createdAfter = new Date(Date.now() - recentMs);

    return await Project.findOne({
        where: {
            userId,
            name: normalized.name,
            buildingTypeId: normalized.buildingTypeId ?? null,
            builtUpArea: normalized.builtUpArea ?? 0,
            levelsCount: normalized.levelsCount ?? 1,
            multiplicationIndex: normalized.multiplicationIndex ?? 1,
            projectComplexity: normalized.projectComplexity ?? null,
            selectedRangeId: normalized.selectedRangeId ?? null,
            selectedColorId: normalized.selectedColorId ?? null,
            createdAt: { [Op.gte]: createdAfter },
        },
        order: [['createdAt', 'DESC']],
    });
};
export const syncProjectWorkspace = async (projectId, workspaceData = {}, userId = null, transaction = undefined) => {
    await ensureProjectOwnership(projectId, userId, transaction);

    const project = await Project.findByPk(projectId, { transaction });
    if (!project) throw createNotFoundError('Project');

    const normalizedLevels = normalizeWorkspaceLevels(workspaceData.levels);
    const projectPayload = normalizeProjectPayload({
        ...(workspaceData.projectInfo || {}),
        levelsCount: normalizedLevels.length || workspaceData.projectInfo?.levelsCount || project.levelsCount || 1,
        selectedRangeId: workspaceData.selectedRangeId ?? workspaceData.rangeId ?? workspaceData.range ?? project.selectedRangeId,
        selectedColorId: workspaceData.selectedColorId ?? workspaceData.colorId ?? workspaceData.color ?? project.selectedColorId,
    });

    await project.update({
        ...projectPayload,
        status: 'active',
    }, { transaction });

    const existingLevels = await ProjectLevel.findAll({
        where: { projectId },
        attributes: ['id'],
        transaction,
    });
    const levelIds = existingLevels.map((level) => level.id);

    if (levelIds.length) {
        const existingRooms = await ProjectRoom.findAll({
            where: { projectLevelId: { [Op.in]: levelIds } },
            attributes: ['id'],
            transaction,
        });
        const roomIds = existingRooms.map((room) => room.id);

        if (roomIds.length) {
            await RoomFunctionSelection.destroy({
                where: { projectRoomId: { [Op.in]: roomIds } },
                transaction,
            });
            await ProjectRoom.destroy({
                where: { id: { [Op.in]: roomIds } },
                transaction,
            });
        }

        await ProjectLevel.destroy({
            where: { id: { [Op.in]: levelIds } },
            transaction,
        });
    }

    for (const levelData of normalizedLevels) {
        const level = await ProjectLevel.create({
            projectId,
            name: levelData.name,
            levelOrder: levelData.levelOrder,
        }, { transaction });

        for (const roomData of levelData.rooms) {
            const room = await ProjectRoom.create({
                projectLevelId: level.id,
                roomTypeId: roomData.roomTypeId,
                name: roomData.name,
                roomCount: roomData.roomCount,
            }, { transaction });

            if (roomData.functionSelections.length) {
                await RoomFunctionSelection.bulkCreate(
                    roomData.functionSelections.map((selection) => ({
                        projectRoomId: room.id,
                        smartFunctionId: selection.smartFunctionId,
                        quantity: selection.quantity,
                    })),
                    { transaction }
                );
            }
        }
    }

    return project;
};

export const getMyProjects = async (userId = null) => {
    const projects = await Project.findAll({
        where: userId ? { userId } : undefined,
        include: [{ model: BuildingType, as: 'buildingType', attributes: ['id', 'name', 'description'] }],
        order: [['updatedAt', 'DESC']]
    });

    return dedupeProjectsById(projects);
};

export const getProjectDetails = async (userId = null, projectId) => {
    const project = await Project.findOne({
        where: userId ? { id: projectId, userId } : { id: projectId },
        include: [
            {
                model: BuildingType,
                as: 'buildingType',
                attributes: ['id', 'name', 'description']
            },
            {
                model: ProjectLevel,
                as: 'levels',
                include: [
                    {
                        model: ProjectRoom,
                        as: 'rooms',
                        include: [
                            {
                                model: RoomType,
                                as: 'roomType'
                            },
                            {
                                model: RoomFunctionSelection,
                                as: 'functionSelections',
                                include: [
                                    {
                                        model: SmartFunction,
                                        as: 'smartFunction'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        order: [
            [{ model: ProjectLevel, as: 'levels' }, 'levelOrder', 'ASC'],
        ]
    });
    return project;
};

export const updateProject = async (userId = null, projectId, projectData) => {
    const where = userId ? { id: projectId, userId } : { id: projectId };
    const project = await Project.findOne({ where });
    if (!project) throw createNotFoundError('Project');
    return await project.update(normalizeProjectPayload(projectData));
};

export const deleteProject = async (userId = null, projectId) => {
    const where = userId ? { id: projectId, userId } : { id: projectId };
    const project = await Project.findOne({ where });
    if (!project) throw createNotFoundError('Project');
    return await project.destroy();
};

export const addLevel = async (projectId, levelData, userId = null) => {
    await ensureProjectOwnership(projectId, userId);
    return await ProjectLevel.create({ ...levelData, projectId });
};

export const updateLevel = async (levelId, levelData, userId = null) => {
    await ensureLevelOwnership(levelId, userId);
    const level = await ProjectLevel.findByPk(levelId);
    if (!level) throw createNotFoundError('Level');
    return await level.update(levelData);
};

export const deleteLevel = async (levelId, userId = null) => {
    await ensureLevelOwnership(levelId, userId);
    const level = await ProjectLevel.findByPk(levelId);
    if (!level) throw createNotFoundError('Level');
    return await level.destroy();
};

export const addRoom = async (projectLevelId, roomData, userId = null) => {
    const level = await ProjectLevel.findByPk(projectLevelId, { include: [{ model: Project, as: 'project', attributes: ['id', 'userId'] }] });
    if (!level?.project) throw createNotFoundError('Level');
    if (userId && level.project.userId !== userId) throw createNotFoundError('Project');
    return await ProjectRoom.create({ ...roomData, projectLevelId });
};

export const updateRoom = async (roomId, roomData, userId = null) => {
    await ensureRoomOwnership(roomId, userId);
    const room = await ProjectRoom.findByPk(roomId);
    if (!room) throw createNotFoundError('Room');
    return await room.update(roomData);
};

export const deleteRoom = async (roomId, userId = null) => {
    await ensureRoomOwnership(roomId, userId);
    const room = await ProjectRoom.findByPk(roomId);
    if (!room) throw createNotFoundError('Room');
    return await room.destroy();
};

export const addFunctionSelection = async (projectRoomId, selectionData, userId = null) => {
    const room = await ProjectRoom.findByPk(projectRoomId, { include: [{ model: ProjectLevel, as: 'level', include: [{ model: Project, as: 'project', attributes: ['userId'] }] }] });
    if (!room?.level?.project) throw createNotFoundError('Room');
    if (userId && room.level.project.userId !== userId) throw createNotFoundError('Room');
    return await RoomFunctionSelection.create({ ...selectionData, projectRoomId });
};

export const updateFunctionSelection = async (selectionId, selectionData, userId = null) => {
    await ensureSelectionOwnership(selectionId, userId);
    const selection = await RoomFunctionSelection.findByPk(selectionId);
    if (!selection) throw createNotFoundError('Selection');
    return await selection.update(selectionData);
};

export const deleteFunctionSelection = async (selectionId, userId = null) => {
    await ensureSelectionOwnership(selectionId, userId);
    const selection = await RoomFunctionSelection.findByPk(selectionId);
    if (!selection) throw createNotFoundError('Selection');
    return await selection.destroy();
};



