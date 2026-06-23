import * as calculationService from "../services/calculationservice.js";
import * as offerService from "../services/offerservice.js";
import * as projectService from "../services/projectservice.js";
import * as exportService from "../services/exportservice.js";
import * as followupService from "../services/followupservice.js";
import * as configuratorDraftService from "../services/configuratordraftservice.js";
import * as notificationService from "../services/notificationservice.js";
import { sendResponse, sendError } from "../utils/apiResponse.js";
import RoomType from "../../models/RoomType.js";
import { isValidOfferStatus, normalizeOfferStatus } from "../constants/offerStatus.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUuid(v) {
  return (
    v != null && typeof v === "string" && UUID_REGEX.test(String(v).trim())
  );
}

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
      smartFunctionId: selection?.smartFunctionId || selection?.id,
      quantity: normalizeRoomCount(selection?.quantity),
    }))
    .filter((selection) => isValidUuid(selection.smartFunctionId));
}

function normalizeLevelsPayload(levels) {
  const source = Array.isArray(levels) ? levels : [];
  return source.map((level) => ({
    ...level,
    id: level.id,
    tempId: level.tempId,
    rooms: (Array.isArray(level.rooms) ? level.rooms : []).map((room) => ({
      ...room,
      id: room.id,
      tempId: room.tempId,
      roomCount: normalizeRoomCount(room.roomCount ?? room.count),
      functionSelections: normalizeFunctionSelections(
        room.functionSelections || room.functions || []
      ),
    })),
  }));
}

function buildCalculationPayload(body) {
    return {
        levels: normalizeLevelsPayload(body?.levels),
    selectedRangeId: isValidUuid(body?.selectedRangeId || body?.rangeId || body?.range)
      ? body.selectedRangeId || body.rangeId || body.range
      : null,
    selectedColorId: isValidUuid(body?.selectedColorId || body?.colorId || body?.color)
      ? body.selectedColorId || body.colorId || body.color
      : null,
    multiplicationIndex:
      body?.multiplicationIndex ??
      body?.projectInfo?.projectMultiplicationIndex ??
      1.0,
    selectedServiceIds: Array.isArray(body?.selectedServiceIds)
      ? body.selectedServiceIds
      : Array.isArray(body?.serviceIds)
      ? body.serviceIds
      : Array.isArray(body?.services)
      ? body.services
      : [],
    language: body?.language === 'ro' || body?.language === 'en' ? body.language : 'en',
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
    language: body?.language === 'ro' || body?.language === 'en' ? body.language : 'en',
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
    const storedPdf = await exportService.readStoredOfferFile(offer.id, 'pdf', req.user, { regenerate: true });
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
    const body = req.body || {};
    const requestedProjectId =
      body.projectId && isValidUuid(String(body.projectId).trim())
        ? String(body.projectId).trim()
        : null;
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
        "At least one level is required. Please add a floor in the configurator."
      );
    }

    const projectName =
      (projectInfo.name && String(projectInfo.name).trim()) ||
      "Untitled Project";
    const rawBuildingTypeId =
      (projectInfo.buildingType && String(projectInfo.buildingType).trim()) ||
      null;
    const buildingTypeId =
      rawBuildingTypeId && isValidUuid(rawBuildingTypeId)
        ? rawBuildingTypeId
        : null;
    const selectedRangeId = rangeId && isValidUuid(rangeId) ? rangeId : null;
    const selectedColorId = colorId && isValidUuid(colorId) ? colorId : null;

    const numArea =
      projectInfo.area != null && projectInfo.area !== ""
        ? Number(projectInfo.area)
        : null;
    const builtUpArea =
      numArea != null && !Number.isNaN(numArea) ? numArea : null;

    let projectId = requestedProjectId;
    if (projectId) {
      let defaultRoomTypeId = null;
      const normalizedLevels = levels.map((level) => ({
        ...level,
        rooms: (Array.isArray(level.rooms) ? level.rooms : []).map((roomData) => {
          const rawRoomTypeId = roomData.type || roomData.roomTypeId;
          return {
            ...roomData,
            roomTypeId:
              rawRoomTypeId && isValidUuid(rawRoomTypeId) ? rawRoomTypeId : null,
          };
        }),
      }));

      for (const level of normalizedLevels) {
        for (const room of level.rooms) {
          if (room.roomTypeId) continue;
          if (!defaultRoomTypeId) {
            const first = await RoomType.findOne({
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
            buildingType: buildingTypeId,
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
          rangeId: selectedRangeId,
          colorId: selectedColorId,
        },
        userId
      );
    } else {
      let defaultRoomTypeId = null;
      const project = await projectService.createProject(userId, {
        name: projectName,
        buildingTypeId,
        levelsCount: levels.length,
        multiplicationIndex: Number(multiplicationIndex) || 1,
        builtUpArea,
        projectComplexity: projectInfo.projectComplexity
          ? String(projectInfo.projectComplexity)
          : null,
        description: projectInfo.description
          ? String(projectInfo.description)
          : null,
        selectedRangeId,
        selectedColorId,
      });
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
          let roomTypeId =
            rawRoomTypeId && isValidUuid(rawRoomTypeId) ? rawRoomTypeId : null;
          if (!roomTypeId) {
            if (!defaultRoomTypeId) {
              const first = await RoomType.findOne({
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
              name: roomData.name || "Room",
              roomTypeId,
              roomCount: normalizeRoomCount(roomData.roomCount ?? roomData.count),
            },
            userId
          );
          const funcs = roomData.functions || roomData.functionSelections || [];
          for (const f of funcs) {
            const rawFuncId = f.smartFunctionId || f.id;
            if (!rawFuncId || !isValidUuid(rawFuncId)) continue;
            await projectService.addFunctionSelection(
              room.id,
              {
                smartFunctionId: rawFuncId,
                quantity: Math.max(1, parseInt(f.quantity, 10) || 1),
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
      rangeId,
      colorId,
      projectInfo: body.projectInfo,
      selectedServiceIds: body.selectedServiceIds || body.serviceIds,
      services: body.selectedServiceIds || body.serviceIds || body.services,
      customerComments: body.customerComments,
    });
    offerData.status = 'offer_generated';
    let offer = await offerService.createOffer(projectId, offerData, req.user);
    const storedPdf = await exportService.readStoredOfferFile(offer.id, 'pdf', req.user, { regenerate: true });
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
    });
    if (!offerData.status) offerData.status = 'offer_generated';

    let offer = await offerService.updateOfferFromConfig(req.params.id, offerData, req.user);
    await exportService.readStoredOfferFile(offer.id, 'pdf', req.user, { regenerate: true });
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
    const userId = req.user.role === "admin" ? null : req.user.id;
    const offers = await offerService.listOffers(projectId || null, userId);
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
    const file = await exportService.readStoredOfferFile(req.params.id, 'excel', req.user, {
      regenerate: shouldRegenerateExport(req),
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
    const file = await exportService.readStoredOfferFile(req.params.id, 'pdf', req.user, {
      regenerate: shouldRegenerateExport(req),
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








