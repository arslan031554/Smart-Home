import * as calculationService from "../services/calculationservice.js";
import * as offerService from "../services/offerservice.js";
import * as projectService from "../services/projectservice.js";
import * as exportService from "../services/exportservice.js";
import * as followupService from "../services/followupservice.js";
import * as configuratorDraftService from "../services/configuratordraftservice.js";
import * as notificationService from "../services/notificationservice.js";
import { normalizeBusinessLanguage } from "../utils/localization.js";
import { sendResponse, sendError } from "../utils/apiResponse.js";
import RoomType from "../../models/RoomType.js";
import BuildingType from "../../models/BuildingType.js";
import ProductRange from "../../models/ProductRange.js";
import Color from "../../models/Color.js";
import SmartFunction from "../../models/SmartFunction.js";
import Service from "../../models/Service.js";
import { isValidOfferStatus, normalizeOfferStatus } from "../constants/offerStatus.js";
import { normalizeUuid, normalizeUuidArray, resolveExistingUuidArray, resolveExistingUuidOrNull, isValidOptionalUuid } from "../utils/idNormalization.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeRoomCount(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function shouldRegenerateExport(req) {
  const value = req.query?.regenerate ?? req.body?.regenerate;
  return value === true || value === "true" || value === "1";
}

function normalizeFunctionSelections(selections) {
  const source = Array.isArray(selections) ? selections : [];
  return source
    .map((selection) => ({
      smartFunctionId: normalizeUuid(selection?.smartFunctionId || selection?.id),
      quantity: normalizeRoomCount(selection?.quantity),
    }))
    .filter((selection) => selection.smartFunctionId);
}

function normalizeLevelsPayload(levels) {
  const source = Array.isArray(levels) ? levels : [];
  return source.map((level) => {
    const isTempLevelId = level.id !== undefined && !isValidOptionalUuid(level.id);
    return {
      ...level,
      id: isTempLevelId ? undefined : level.id,
      tempId: isTempLevelId ? level.id : level.tempId,
      rooms: (Array.isArray(level.rooms) ? level.rooms : []).map((room) => {
        const isTempRoomId = room.id !== undefined && !isValidOptionalUuid(room.id);
        return {
          ...room,
          id: isTempRoomId ? undefined : room.id,
          tempId: isTempRoomId ? room.id : room.tempId,
          roomCount: normalizeRoomCount(room.roomCount ?? room.count),
          functionSelections: normalizeFunctionSelections(
            room.functionSelections || room.functions || []
          ),
        };
      }),
    };
  });
}

function buildCalculationPayload(body) {
  return {
    levels: normalizeLevelsPayload(body?.levels),
    selectedRangeId: normalizeUuid(body?.selectedRangeId || body?.rangeId || body?.range),
    selectedColorId: normalizeUuid(body?.selectedColorId || body?.colorId || body?.color),
    multiplicationIndex:
      body?.multiplicationIndex ??
      body?.projectInfo?.projectMultiplicationIndex ??
      1.0,
    selectedServiceIds: normalizeUuidArray(
      Array.isArray(body?.selectedServiceIds)
        ? body.selectedServiceIds
        : Array.isArray(body?.serviceIds)
        ? body.serviceIds
        : Array.isArray(body?.services)
        ? body.services
        : []
    ),
    language: normalizeBusinessLanguage(body?.language),
  };
}

export const calculate = async (req, res, next) => {
  try {
    const projectData = buildCalculationPayload(req.body || {});
    const result = await calculationService.calculateOffer(projectData);
    sendResponse(res, 200, true, "Calculation successful", result);
  } catch (error) {
    next(error);
  }
};

function normalizeOfferPayload(body) {
  const normalized = buildCalculationPayload(body || {});
  return {
    ...normalized,
    projectInfo:
      body?.projectInfo && typeof body.projectInfo === 'object'
        ? {
            ...body.projectInfo,
            levelsCount:
              body.projectInfo.levelsCount ?? normalized.levels.length ?? 1,
            projectMultiplicationIndex:
              body.projectInfo.projectMultiplicationIndex ??
              normalized.multiplicationIndex ??
              1,
          }
        : undefined,
    customerComments: body?.customerComments || null,
    status: body?.status || body?.offerStatus || undefined,
    language: normalizeBusinessLanguage(body?.language || normalized?.language),
  };
}

export const createOffer = async (req, res, next) => {
  try {
    const { projectId, ...rest } = req.body;
    if (!projectId) return sendError(res, 400, "Validation failed", { projectId: "Project ID is required" });

    const offerData = normalizeOfferPayload({
      ...rest,
      levels: rest.levels || [],
    });
    // Creating an offer implies the proposal document has been generated unless explicitly passed.
    if (!offerData.status) offerData.status = 'offer_generated';
    let offer = await offerService.createOffer(projectId, offerData, req.user);
    const storedPdf = await exportService.readStoredOfferFile(offer.id, 'pdf', req.user, {
      regenerate: true,
      language: offerData.language,
    });
    offer = await offerService.getOfferById(offer.id, req.user);

    // Auto-email PDF to customer (requirement). Fire-and-forget.
    if (normalizeOfferStatus(offer?.status) === 'offer_generated' && offer?.project?.user?.email) {
      const offerUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/offers/${offer.id}`;
      setImmediate(async () => {
        try {
          await notificationService.sendOfferPdfEmail({
            to: offer.project.user.email,
            customerName: offer.project.user.fullName,
            offerNumber: offer.offerNumber,
            offerUrl,
            pdfBuffer: storedPdf.buffer,
            language: offer.calculationSnapshot?.language,
          });
        } catch (err) {
          console.error('[Offer Email] Failed to send offer PDF:', err?.message || err);
        }
      });
    }

    sendResponse(res, 201, true, "Offer created successfully", offer);
  } catch (error) {
    next(error);
  }
};

/** Create project from configurator payload then create offer (one-shot for frontend). */
export const createOfferFromConfig = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectScopeUserId = req.user.role === 'admin' ? null : userId;
    const body = req.body || {};
    const requestedProjectId = normalizeUuid(body.projectId);
    const projectInfo = body.projectInfo || {};
    const levels = normalizeLevelsPayload(body.levels);
    const rangeId = body.rangeId ?? body.selectedRangeId ?? null;
    const colorId = body.colorId ?? body.selectedColorId ?? null;
    const multiplicationIndex =
      body.projectInfo?.projectMultiplicationIndex ?? 1.0;

    if (!levels.length) {
      return sendError(
        res,
        400,
        "Cannot generate offer: at least one level is required"
      );
    }

    const projectName =
      projectInfo.name?.trim() ||
      projectInfo.projectName?.trim() ||
      `Smart Home Configuration - ${new Date().toLocaleDateString()}`;

    const rawBuildingTypeId =
      projectInfo.buildingType || projectInfo.buildingTypeId;
    const rawRangeId = rangeId || projectInfo.selectedRangeId;
    const rawColorId = colorId || projectInfo.selectedColorId;

    const [validBuildingTypeId, validSelectedRangeId, validSelectedColorId] =
      await Promise.all([
        resolveExistingUuidOrNull({
          model: BuildingType,
          value: rawBuildingTypeId,
        }),
        resolveExistingUuidOrNull({
          model: ProductRange,
          value: rawRangeId,
        }),
        resolveExistingUuidOrNull({
          model: Color,
          value: rawColorId,
        }),
      ]);

    const validServiceIds = await resolveExistingUuidArray({
      model: Service,
      values: body.selectedServiceIds || body.serviceIds || body.services,
    });

    const numArea =
      projectInfo.area != null && projectInfo.area !== ""
        ? Number(projectInfo.area)
        : null;
    const builtUpArea =
      numArea != null && !Number.isNaN(numArea) ? numArea : null;

    const projectCreatePayload = {
      name: projectName,
      buildingTypeId: validBuildingTypeId,
      levelsCount: levels.length,
      multiplicationIndex: Number(multiplicationIndex) || 1,
      builtUpArea,
      projectComplexity: projectInfo.projectComplexity
        ? String(projectInfo.projectComplexity)
        : null,
      description: projectInfo.description
        ? String(projectInfo.description)
        : null,
      selectedRangeId: validSelectedRangeId,
      selectedColorId: validSelectedColorId,
    };

    let projectId = requestedProjectId;
    if (projectId) {
      const existingProject = await projectService.getProjectDetails(projectScopeUserId, projectId);
      if (!existingProject) projectId = null;
    }

    if (!projectId) {
      const recentProject = await projectService.findRecentMatchingProject(userId, projectCreatePayload);
      if (recentProject) projectId = recentProject.id;
    }

    if (projectId) {
      let defaultRoomTypeId = null;
      const normalizedLevels = levels.map((level) => ({
        ...level,
        rooms: (Array.isArray(level.rooms) ? level.rooms : []).map((roomData) => {
          const rawRoomTypeId = roomData.type || roomData.roomTypeId;
          return {
            ...roomData,
            roomTypeId: normalizeUuid(rawRoomTypeId),
          };
        }),
      }));

      for (const level of normalizedLevels) {
        for (const room of level.rooms) {
          if (room.roomTypeId) continue;
          if (!defaultRoomTypeId) {
            const first = await RoomType.findOne({
              where: { isActive: true },
              order: [["name", "ASC"]],
              attributes: ["id"],
            });
            defaultRoomTypeId = first?.id || null;
          }
          room.roomTypeId = defaultRoomTypeId;
        }
        level.rooms = level.rooms.filter((room) => room.roomTypeId);
      }

      await projectService.syncProjectWorkspace(
        projectId,
        {
          projectInfo: {
            ...projectInfo,
            name: projectName,
            buildingType: validBuildingTypeId,
            levelsCount: levels.length,
            builtUpArea,
            area: builtUpArea,
            projectMultiplicationIndex: Number(multiplicationIndex) || 1,
            projectComplexity: projectInfo.projectComplexity
              ? String(projectInfo.projectComplexity)
              : null,
            description: projectInfo.description
              ? String(projectInfo.description)
              : null,
          },
          levels: normalizedLevels,
          rangeId: validSelectedRangeId,
          colorId: validSelectedColorId,
        },
        projectScopeUserId
      );
    } else {
      let defaultRoomTypeId = null;
      const project = await projectService.createProject(userId, projectCreatePayload);
      projectId = project.id;

      for (let i = 0; i < levels.length; i++) {
        const levelData = levels[i];
        const level = await projectService.addLevel(
          project.id,
          {
            name: levelData.name || `Level ${i + 1}`,
            levelOrder: i,
          },
          userId
        );
        const rooms = levelData.rooms || [];
        for (const roomData of rooms) {
          const rawRoomTypeId = roomData.type || roomData.roomTypeId;
          let roomTypeId = await resolveExistingUuidOrNull({ model: RoomType, value: rawRoomTypeId });
          if (!roomTypeId) {
            if (!defaultRoomTypeId) {
              const first = await RoomType.findOne({
                where: { isActive: true },
                order: [["name", "ASC"]],
                attributes: ["id"],
              });
              defaultRoomTypeId = first?.id || null;
            }
            roomTypeId = defaultRoomTypeId;
          }
          if (!roomTypeId) continue;
          const room = await projectService.addRoom(
            level.id,
            {
              name: roomData.name || `Room ${roomData.roomOrder || 1}`,
              roomTypeId,
              roomCount: normalizeRoomCount(roomData.roomCount ?? roomData.count),
            },
            userId
          );
          const selections = Array.isArray(roomData.functionSelections)
            ? roomData.functionSelections
            : Array.isArray(roomData.functions)
            ? roomData.functions
            : [];
          for (const fn of selections) {
            const rawFunctionId = fn?.smartFunctionId || fn?.id;
            const functionId = await resolveExistingUuidOrNull({ model: SmartFunction, value: rawFunctionId });
            if (!functionId) continue;
            await projectService.addFunctionToRoom(
              room.id,
              {
                smartFunctionId: functionId,
                quantity: normalizeRoomCount(fn.quantity),
              },
              userId
            );
          }
        }
      }
    }

    const offerData = normalizeOfferPayload({
      projectId,
      levels,
      rangeId: validSelectedRangeId,
      colorId: validSelectedColorId,
      projectInfo: body.projectInfo,
      selectedServiceIds: validServiceIds,
      services: validServiceIds,
      customerComments: body.customerComments,
      language: normalizeBusinessLanguage(body.language || req.query.lang || req.query.language),
    });
    offerData.status = 'offer_generated';
    let offer = await offerService.createOffer(projectId, offerData, req.user);
    const storedPdf = await exportService.readStoredOfferFile(offer.id, 'pdf', req.user, {
      regenerate: true,
      language: offerData.language,
    });
    offer = await offerService.getOfferById(offer.id, req.user);
    await configuratorDraftService.completeCurrentDraft({ userId, offerId: offer.id });

    // Auto-email PDF to customer (requirement). Fire-and-forget.
    if (normalizeOfferStatus(offer?.status) === 'offer_generated' && offer?.project?.user?.email) {
      const offerUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/offers/${offer.id}`;
      setImmediate(async () => {
        try {
          await notificationService.sendOfferPdfEmail({
            to: offer.project.user.email,
            customerName: offer.project.user.fullName,
            offerNumber: offer.offerNumber,
            offerUrl,
            pdfBuffer: storedPdf.buffer,
            language: offer.calculationSnapshot?.language,
          });
        } catch (err) {
          console.error('[Offer Email] Failed to send offer PDF:', err?.message || err);
        }
      });
    }

    sendResponse(res, 201, true, "Offer created successfully", offer);
  } catch (error) {
    next(error);
  }
};

export const updateOfferFromConfig = async (req, res, next) => {
  try {
    const offerData = normalizeOfferPayload({
      ...(req.body || {}),
      levels: req.body?.levels || [],
      language: normalizeBusinessLanguage(req.body?.language || req.query?.lang || req.query?.language),
    });
    if (!offerData.status) offerData.status = 'offer_generated';

    let offer = await offerService.updateOfferFromConfig(req.params.id, offerData, req.user);
    await exportService.readStoredOfferFile(offer.id, 'pdf', req.user, {
      regenerate: true,
      language: offerData.language,
    });
    offer = await offerService.getOfferById(offer.id, req.user);
    await configuratorDraftService.completeCurrentDraft({ userId: req.user.id, offerId: offer.id });
    sendResponse(res, 200, true, "Offer updated successfully", offer);
  } catch (error) {
    next(error);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    const result = await offerService.deleteOffer(req.params.id, req.user);
    sendResponse(res, 200, true, "Offer deleted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getOfferDetails = async (req, res, next) => {
  try {
    const offer = await offerService.getOfferById(req.params.id, req.user);
    if (!offer) return sendError(res, 404, "Offer not found");
    const oo = offer.toJSON ? offer.toJSON() : offer;
    const f = oo.followup || null;
    const normalized = {
      ...oo,
      followUp: f ? {
        enabled: !!f.enabled,
        status: f.status || 'pending',
        nextReminderAt: f.nextReminderAt || null,
        reason: f.reason || null,
        channels: { email: !!f.channelEmail, sms: !!f.channelSms }
      } : { enabled: false }
    };
    sendResponse(res, 200, true, "Offer details fetched", normalized);
  } catch (error) {
    next(error);
  }
};

export const listOffers = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const offers = await offerService.listOffers(projectId || null, req.user.id);
    sendResponse(res, 200, true, "Offers fetched", offers);
  } catch (error) {
    next(error);
  }
};

export const listAdminOffers = async (req, res, next) => {
  try {
    const result = await offerService.listAdminOffers(req.query || {});
    sendResponse(res, 200, true, "Admin offers fetched", result);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!isValidOfferStatus(status)) {
      return sendError(res, 400, "Validation failed", { status: "Invalid offer status" });
    }
    const offer = await offerService.updateOfferStatus(req.params.id, status, req.user);
    sendResponse(res, 200, true, "Offer status updated", offer);
  } catch (error) {
    next(error);
  }
};

export const updateFollowup = async (req, res, next) => {
  try {
    const offerId = req.params.id;
    const body = req.body || {};

    const patch = {};
    if (body.enabled !== undefined) patch.enabled = Boolean(body.enabled);
    if (body.channelEmail !== undefined) patch.channelEmail = Boolean(body.channelEmail);
    if (body.channelSms !== undefined) patch.channelSms = Boolean(body.channelSms);
    if (body.reason !== undefined) patch.reason = body.reason ? String(body.reason) : null;

    if (body.nextReminderAt !== undefined) {
      const d = body.nextReminderAt ? new Date(body.nextReminderAt) : null;
      if (d && Number.isNaN(d.getTime())) {
        return sendError(res, 400, "Validation failed", { nextReminderAt: "Invalid date" });
      }
      patch.nextReminderAt = d;
    }
    if (body.snoozedUntil !== undefined) {
      const d = body.snoozedUntil ? new Date(body.snoozedUntil) : null;
      if (d && Number.isNaN(d.getTime())) {
        return sendError(res, 400, "Validation failed", { snoozedUntil: "Invalid date" });
      }
      patch.snoozedUntil = d;
    }

    // Convenience: if client sends nextReminderAt in future, mark as snoozed
    if (patch.nextReminderAt && patch.nextReminderAt.getTime() > Date.now()) {
      patch.status = 'snoozed';
    }

    const followup = await followupService.updateFollowupSettings(offerId, patch, req.user);
    sendResponse(res, 200, true, "Follow-up settings updated", followup);
  } catch (error) {
    next(error);
  }
};

export const sendReminderEmail = async (req, res, next) => {
  try {
    const followup = await followupService.sendOfferReminderEmailNow(req.params.id, req.user);
    sendResponse(res, 200, true, "Reminder email sent", followup);
  } catch (error) {
    next(error);
  }
};

export const duplicateOffer = async (req, res, next) => {
  try {
    const offer = await offerService.duplicateOffer(req.params.id, req.user);
    sendResponse(res, 201, true, "Offer duplicated successfully", offer);
  } catch (error) {
    next(error);
  }
};

export const exportExcel = async (req, res, next) => {
  try {
    const lang = req.query.lang || req.query.language || null;
    const file = await exportService.readStoredOfferFile(req.params.id, 'excel', req.user, {
      regenerate: shouldRegenerateExport(req) || Boolean(lang),
      language: lang,
    });
    res.setHeader(
      "Content-Type",
      file.mimeType
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.generatedFilename}"`
    );
    res.send(file.buffer);
  } catch (error) {
    next(error);
  }
};

export const exportPdf = async (req, res, next) => {
  try {
    const lang = req.query.lang || req.query.language || null;
    const file = await exportService.readStoredOfferFile(req.params.id, 'pdf', req.user, {
      regenerate: true,
      language: lang,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.generatedFilename}"`
    );
    res.send(file.buffer);
  } catch (error) {
    next(error);
  }
};
