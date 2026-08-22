import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { normalizeApiError } from '../../utils/normalizeApiError';
import { getOrCreateGuestSessionId } from '../../utils/configuratorDraftStorage';
import {
    buildNormalizedOfferPayload,
    normalizeConfiguratorLevels,
    normalizeConfiguratorRoom,
    normalizeFunctionSelection,
    normalizeRoomCount,
} from '../../utils/configuratorNormalization';

import { generateOffer } from '../offers/offersSlice';

function clearCalculation(state) {
    state.calculation = null;
}

function clampConfiguratorStep(value) {
    return Math.max(1, Math.min(parseInt(value, 10) || 1, 8));
}

function clearDownstreamSelections(state) {
    state.services = [];
    state.range = null;
    state.color = null;
    clearCalculation(state);
}

function normalizeRoomUpdate(data = {}) {
    const next = { ...data };
    if (next.count !== undefined || next.roomCount !== undefined) {
        next.roomCount = normalizeRoomCount(next.roomCount ?? next.count);
        delete next.count;
    }
    if (Array.isArray(next.functions)) {
        next.functions = next.functions.map(normalizeFunctionSelection);
    }
    return next;
}

function applyHydratedConfiguratorState(state, snapshot = {}) {
    if (snapshot.projectInfo) state.projectInfo = { ...state.projectInfo, ...snapshot.projectInfo };
    if (Array.isArray(snapshot.levels)) state.levels = normalizeConfiguratorLevels(snapshot.levels);
    if (Array.isArray(snapshot.services)) state.services = snapshot.services;
    if (snapshot.range !== undefined) state.range = snapshot.range;
    if (snapshot.color !== undefined) state.color = snapshot.color;
    if (snapshot.customerComments !== undefined) state.customerComments = snapshot.customerComments;
    if (snapshot.currentProjectId !== undefined) state.currentProjectId = snapshot.currentProjectId;
    if (snapshot.currentOfferId !== undefined) state.currentOfferId = snapshot.currentOfferId;
    if (snapshot.currentStep !== undefined) {
        state.currentStep = Math.max(state.currentStep || 1, clampConfiguratorStep(snapshot.currentStep));
    }
}

function buildProjectInfoFromOffer(offer, levels) {
    const snapshot = offer?.calculationSnapshot || {};
    const snapshotProjectInfo = snapshot.projectInfo || {};
    const project = offer?.project || {};

    return {
        name: snapshotProjectInfo.name || project.name || '',
        buildingType: snapshotProjectInfo.buildingType || project.buildingType?.id || '',
        levelsCount: Math.max(1, parseInt((snapshotProjectInfo.levelsCount ?? project.levelsCount ?? levels.length ?? 1), 10) || 1),
        area: snapshotProjectInfo.area ?? project.builtUpArea ?? '',
        description: snapshotProjectInfo.description || project.description || '',
        projectComplexity: snapshotProjectInfo.projectComplexity || project.projectComplexity || '',
        projectMultiplicationIndex: Math.max(1, parseInt((snapshotProjectInfo.projectMultiplicationIndex ?? project.multiplicationIndex ?? snapshot.multiplicationIndex ?? 1), 10) || 1),
        clientType: snapshotProjectInfo.clientType || 'private',
        companyName: snapshotProjectInfo.companyName || '',
    };
}

function buildProjectInfoFromProject(project, levels) {
    return {
        name: project?.name || '',
        buildingType: project?.buildingType?.id || project?.buildingTypeId || '',
        levelsCount: Math.max(1, parseInt((project?.levelsCount ?? levels.length ?? 1), 10) || 1),
        area: project?.builtUpArea ?? '',
        description: project?.description || '',
        projectComplexity: project?.projectComplexity || '',
        projectMultiplicationIndex: Math.max(1, parseInt((project?.multiplicationIndex ?? 1), 10) || 1),
        clientType: 'private',
        companyName: '',
    };
}

function extractOfferConfiguratorState(offer) {
    const snapshot = offer?.calculationSnapshot || {};
    const levels = normalizeConfiguratorLevels(Array.isArray(snapshot.levels) ? snapshot.levels : []);
    const selectedServiceIds = Array.isArray(snapshot.selectedServiceIds)
        ? snapshot.selectedServiceIds
        : Array.isArray(snapshot.serviceIds)
            ? snapshot.serviceIds
            : Array.isArray(snapshot.services)
                ? snapshot.services.map((service) => (typeof service === 'object' ? service.id || service.serviceId : service)).filter(Boolean)
                : Array.isArray(offer?.services)
                    ? offer.services.map((service) => service.serviceId || service.id).filter(Boolean)
                    : [];

    return {
        id: offer?.id || null,
        projectId: offer?.projectId || null,
        levels,
        services: selectedServiceIds,
        range: snapshot.selectedRangeId ?? snapshot.rangeId ?? snapshot.range ?? null,
        color: snapshot.selectedColorId ?? snapshot.colorId ?? snapshot.color ?? null,
        customerComments: offer?.customerComments ?? snapshot.customerComments ?? '',
        projectInfo: buildProjectInfoFromOffer(offer, levels),
    };
}

function extractProjectConfiguratorState(project) {
    const levels = normalizeConfiguratorLevels(
        Array.isArray(project?.levels)
            ? project.levels.map((level) => ({
                id: level.id,
                name: level.name,
                rooms: Array.isArray(level.rooms)
                    ? level.rooms.map((room) => ({
                        id: room.id,
                        type: room.roomTypeId || room.roomType?.id || '',
                        roomTypeId: room.roomTypeId || room.roomType?.id || '',
                        name: room.name || room.roomType?.name || 'Room',
                        roomCount: normalizeRoomCount(room.roomCount ?? room.count),
                        functions: Array.isArray(room.functionSelections)
                            ? room.functionSelections.map((selection) => ({
                                id: selection.smartFunctionId || selection.smartFunction?.id,
                                smartFunctionId: selection.smartFunctionId || selection.smartFunction?.id,
                                quantity: normalizeRoomCount(selection.quantity),
                            }))
                            : [],
                    }))
                    : [],
            }))
            : []
    );

    return {
        id: project?.id || null,
        projectId: project?.id || null,
        levels,
        services: [],
        range: project?.selectedRangeId ?? null,
        color: project?.selectedColorId ?? null,
        customerComments: '',
        projectInfo: buildProjectInfoFromProject(project, levels),
    };
}

export const fetchCalculation = createAsyncThunk(
    'configurator/fetchCalculation',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { configurator } = getState();
            const payload = buildNormalizedOfferPayload(configurator);
            const response = await api.post('/offers/calculate', payload);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    }
);

export const syncConfiguratorDraft = createAsyncThunk(
    'configurator/syncConfiguratorDraft',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            if (!state.auth?.isAuthenticated) return null;

            const { configurator } = state;
            const normalized = buildNormalizedOfferPayload(configurator);
            const payload = {
                projectInfo: normalized.projectInfo,
                levels: normalized.levels,
                services: normalized.selectedServiceIds,
                range: normalized.rangeId,
                color: normalized.colorId,
                customerComments: normalized.customerComments,
                currentProjectId: configurator.currentProjectId || null,
                currentOfferId: configurator.currentOfferId || null,
                currentStep: configurator.currentStep || 1,
                language: normalized.language || configurator.calculation?.language || 'en',
            };
            const response = await api.put('/configurator-drafts/current', payload);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    }
);

export const fetchCurrentConfiguratorDraft = createAsyncThunk(
    'configurator/fetchCurrentConfiguratorDraft',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            if (!state.auth?.isAuthenticated) return null;
            const response = await api.get('/configurator-drafts/current');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    }
);


export const fetchPublicConfiguratorDraft = createAsyncThunk(
    'configurator/fetchPublicConfiguratorDraft',
    async (_, { rejectWithValue }) => {
        try {
            const guestSessionId = getOrCreateGuestSessionId();
            const response = await api.get('/configurator-drafts/current/public', {
                params: { guestSessionId },
                headers: { 'x-guest-session-id': guestSessionId },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    }
);

export const syncGuestConfiguratorDraft = createAsyncThunk(
    'configurator/syncGuestConfiguratorDraft',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { configurator } = getState();
            const guestSessionId = getOrCreateGuestSessionId();
            const normalized = buildNormalizedOfferPayload(configurator);
            const payload = {
                guestSessionId,
                projectInfo: normalized.projectInfo,
                levels: normalized.levels,
                services: normalized.selectedServiceIds,
                range: normalized.rangeId,
                color: normalized.colorId,
                customerComments: normalized.customerComments,
                currentProjectId: configurator.currentProjectId || null,
                currentOfferId: configurator.currentOfferId || null,
                currentStep: configurator.currentStep || 1,
                language: normalized.language || configurator.calculation?.language || 'en',
            };
            const response = await api.put('/configurator-drafts/current/public', payload, {
                headers: { 'x-guest-session-id': guestSessionId },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    }
);

export const attachGuestDraftToAccount = createAsyncThunk(
    'configurator/attachGuestDraftToAccount',
    async (_, { rejectWithValue }) => {
        try {
            const guestSessionId = getOrCreateGuestSessionId();
            const response = await api.post('/configurator-drafts/current/attach', { guestSessionId }, {
                headers: { 'x-guest-session-id': guestSessionId },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    }
);

export const loadProjectWorkspace = createAsyncThunk(
    'configurator/loadProjectWorkspace',
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/projects/${projectId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    }
);

export const reopenOfferById = createAsyncThunk(
    'configurator/reopenOfferById',
    async (offerId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/offers/${offerId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(normalizeApiError(error));
        }
    }
);

const initialState = {
    currentStep: 1,
    projectInfo: {
        name: '',
        buildingType: '',
        levelsCount: 1,
        area: '',
        description: '',
        projectComplexity: '',
        projectMultiplicationIndex: 1,
        clientType: 'private',
        companyName: '',
    },
    levels: [
        { id: 1, name: 'Ground Floor', rooms: [] },
    ],
    services: [],
    range: null,
    color: null,
    customerComments: '',
    status: 'idle',
    isGuest: false,
    currentProjectId: null,
    currentOfferId: null,
    calculation: null,
    isCalculating: false,
    calcError: null,
};

const configuratorSlice = createSlice({
    name: 'configurator',
    initialState,
    reducers: {
        setStep: (state, action) => {
            state.currentStep = action.payload;
        },

        updateProjectInfo: (state, action) => {
            const prevBuilding = state.projectInfo.buildingType;
            const prevMultiplicationIndex = state.projectInfo.projectMultiplicationIndex;
            state.projectInfo = { ...state.projectInfo, ...action.payload };

            if (action.payload.buildingType && action.payload.buildingType !== prevBuilding) {
                state.levels = [{ id: 1, name: 'Ground Floor', rooms: [] }];
                clearDownstreamSelections(state);
            }

            if (action.payload.projectMultiplicationIndex !== undefined) {
                const nextMultiplier = parseFloat(action.payload.projectMultiplicationIndex);
                state.projectInfo.projectMultiplicationIndex = Number.isFinite(nextMultiplier) && nextMultiplier >= 1 ? nextMultiplier : 1;
            }

            if (
                action.payload.projectMultiplicationIndex !== undefined &&
                action.payload.projectMultiplicationIndex !== prevMultiplicationIndex
            ) {
                clearCalculation(state);
            }

            let targetCount = parseInt(
                action.payload.levelsCount !== undefined
                    ? action.payload.levelsCount
                    : state.projectInfo.levelsCount,
                10
            );
            if (Number.isNaN(targetCount) || targetCount < 1) targetCount = 1;
            if (targetCount > 20) targetCount = 20;
            state.projectInfo.levelsCount = targetCount;

            const currentCount = state.levels.length;
            if (targetCount > currentCount) {
                for (let i = currentCount + 1; i <= targetCount; i += 1) {
                    const name = i === 1 ? 'Ground Floor' : i === 2 ? '1st Floor' : `${i - 1}${i === 3 ? 'nd' : i === 4 ? 'rd' : 'th'} Floor`;
                    state.levels.push({ id: i, name, rooms: [] });
                }
                clearCalculation(state);
            } else if (targetCount < currentCount) {
                state.levels = state.levels.slice(0, targetCount);
                clearCalculation(state);
            }

            state.levels = normalizeConfiguratorLevels(state.levels);
        },

        addRoomToLevel: (state, action) => {
            const { levelId, room } = action.payload;
            const level = state.levels.find((item) => item.id === levelId);
            if (level) {
                level.rooms.push(
                    normalizeConfiguratorRoom({
                        ...room,
                        id: Date.now().toString() + Math.random().toString(36).slice(2),
                    })
                );
            }
            clearDownstreamSelections(state);
        },

        removeRoomFromLevel: (state, action) => {
            const { levelId, roomId } = action.payload;
            const level = state.levels.find((item) => item.id === levelId);
            if (level) {
                level.rooms = level.rooms.filter((room) => room.id !== roomId);
            }
            clearDownstreamSelections(state);
        },

        updateRoom: (state, action) => {
            const { levelId, roomId, data } = action.payload;
            const level = state.levels.find((item) => item.id === levelId);
            if (!level) return;

            const room = level.rooms.find((item) => item.id === roomId);
            if (!room) return;

            const prevType = room.type;
            const normalizedData = normalizeRoomUpdate(data);
            Object.assign(room, normalizedData);
            room.roomCount = normalizeRoomCount(room.roomCount ?? room.count);

            if (normalizedData.type !== undefined && normalizedData.type !== prevType) {
                room.functions = [];
                clearDownstreamSelections(state);
                return;
            }

            if (normalizedData.roomCount !== undefined) {
                clearCalculation(state);
            }
        },

        addFunctionToRoom: (state, action) => {
            const { levelId, roomId, func } = action.payload;
            const level = state.levels.find((item) => item.id === levelId);
            if (!level) return;

            const room = level.rooms.find((item) => item.id === roomId);
            if (!room) return;

            const existingFunc = room.functions.find((item) => item.id === func.id);
            if (existingFunc) {
                existingFunc.quantity = normalizeRoomCount((existingFunc.quantity || 1) + 1);
            } else {
                room.functions.push(normalizeFunctionSelection({ ...func, quantity: 1 }));
            }
            clearDownstreamSelections(state);
        },

        removeFunctionFromRoom: (state, action) => {
            const { levelId, roomId, funcId } = action.payload;
            const level = state.levels.find((item) => item.id === levelId);
            if (!level) return;

            const room = level.rooms.find((item) => item.id === roomId);
            if (!room) return;

            room.functions = room.functions.filter((func) => func.id !== funcId);
            clearDownstreamSelections(state);
        },

        updateFunctionQuantity: (state, action) => {
            const { levelId, roomId, funcId, quantity } = action.payload;
            const level = state.levels.find((item) => item.id === levelId);
            if (!level) return;

            const room = level.rooms.find((item) => item.id === roomId);
            if (!room) return;

            const func = room.functions.find((item) => item.id === funcId);
            if (!func) return;

            const safeQty = parseInt(quantity, 10);
            if (!Number.isFinite(safeQty) || safeQty < 1) {
                room.functions = room.functions.filter((item) => item.id !== funcId);
            } else {
                func.quantity = normalizeRoomCount(safeQty);
            }
            clearDownstreamSelections(state);
        },

        toggleService: (state, action) => {
            const serviceId = typeof action.payload === 'object' ? action.payload.id : action.payload;
            const index = state.services.indexOf(serviceId);
            if (index >= 0) {
                state.services.splice(index, 1);
            } else {
                state.services.push(serviceId);
            }
            clearCalculation(state);
        },

        setComments: (state, action) => {
            state.customerComments = action.payload;
        },

        setRange: (state, action) => {
            state.range = action.payload;
            clearCalculation(state);
        },

        setColor: (state, action) => {
            state.color = action.payload;
            clearCalculation(state);
        },

        clearConfiguratorCalculation: (state) => {
            clearCalculation(state);
            state.isCalculating = false;
            state.calcError = null;
        },

        reopenOffer: (state, action) => {
            const reopened = extractOfferConfiguratorState(action.payload || {});
            state.levels = reopened.levels.length ? reopened.levels : [{ id: 1, name: 'Ground Floor', rooms: [] }];
            state.services = reopened.services;
            state.range = reopened.range;
            state.color = reopened.color;
            state.customerComments = reopened.customerComments;
            state.projectInfo = { ...state.projectInfo, ...reopened.projectInfo };
            state.currentProjectId = reopened.projectId || null;
            state.currentOfferId = reopened.id;
            state.currentStep = 1;
            state.calculation = null;
            state.calcError = null;
        },

        setIsGuest: (state, action) => {
            state.isGuest = action.payload;
        },

        hydrateConfigurator: (state, action) => {
            applyHydratedConfiguratorState(state, action.payload || {});
        },

        resetConfigurator: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCalculation.pending, (state) => {
                state.isCalculating = true;
                state.calcError = null;
            })
            .addCase(fetchCalculation.fulfilled, (state, action) => {
                state.isCalculating = false;
                state.calculation = action.payload;
            })
            .addCase(fetchCalculation.rejected, (state, action) => {
                state.isCalculating = false;
                state.calcError = action.payload?.message || 'Calculation failed';
            })

            .addCase(fetchCurrentConfiguratorDraft.fulfilled, (state, action) => {
                const snap = action.payload?.snapshot;
                if (!snap) return;
                applyHydratedConfiguratorState(state, snap);
            })
            .addCase(fetchPublicConfiguratorDraft.fulfilled, (state, action) => {
                const snap = action.payload?.snapshot;
                if (!snap) return;
                applyHydratedConfiguratorState(state, snap);
            })
            .addCase(loadProjectWorkspace.fulfilled, (state, action) => {
                const workspace = extractProjectConfiguratorState(action.payload || {});
                state.levels = workspace.levels.length ? workspace.levels : [{ id: 1, name: 'Ground Floor', rooms: [] }];
                state.services = workspace.services;
                state.range = workspace.range;
                state.color = workspace.color;
                state.customerComments = workspace.customerComments;
                state.projectInfo = { ...state.projectInfo, ...workspace.projectInfo };
                state.currentProjectId = workspace.projectId || null;
                state.currentOfferId = null;
                state.currentStep = 1;
                state.calculation = null;
                state.calcError = null;
            })
            .addCase(attachGuestDraftToAccount.fulfilled, (state, action) => {
                const snap = action.payload?.snapshot;
                if (!snap) return;
                applyHydratedConfiguratorState(state, snap);
            })
            .addCase(reopenOfferById.fulfilled, (state, action) => {
                const reopened = extractOfferConfiguratorState(action.payload || {});
                state.levels = reopened.levels.length ? reopened.levels : [{ id: 1, name: 'Ground Floor', rooms: [] }];
                state.services = reopened.services;
                state.range = reopened.range;
                state.color = reopened.color;
                state.customerComments = reopened.customerComments;
                state.projectInfo = { ...state.projectInfo, ...reopened.projectInfo };
                state.currentProjectId = reopened.projectId || null;
                state.currentOfferId = reopened.id;
                state.currentStep = 1;
                state.calculation = null;
                state.calcError = null;
            })
            .addCase(generateOffer.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    state.currentOfferId = action.payload.id;
                }
            });
    },
});

export const {
    setStep,
    updateProjectInfo,
    addRoomToLevel,
    removeRoomFromLevel,
    updateRoom,
    addFunctionToRoom,
    removeFunctionFromRoom,
    updateFunctionQuantity,
    toggleService,
    setComments,
    setRange,
    setColor,
    clearConfiguratorCalculation,
    reopenOffer,
    setIsGuest,
    hydrateConfigurator,
    resetConfigurator,
} = configuratorSlice.actions;

export default configuratorSlice.reducer;

