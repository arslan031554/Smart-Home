import Project from '../../models/Project.js';
import Offer from '../../models/Offer.js';
import OfferFollowup from '../../models/OfferFollowup.js';
import BuildingType from '../../models/BuildingType.js';
import { Op } from 'sequelize';

const RECENT_LIMIT = 5;
const REMINDER_DAYS_AHEAD = 7;

/**
 * Returns dashboard data for the authenticated user only.
 * No mock data; all from DB.
 */
export const getDashboard = async (userId, userSummary) => {
    if (!userId) throw new Error('User ID required');

    const [projects, offers] = await Promise.all([
        Project.findAll({
            where: { userId },
            order: [['updatedAt', 'DESC']],
            include: [{ model: BuildingType, as: 'buildingType', attributes: ['id', 'name'] }],
            attributes: ['id', 'name', 'buildingTypeId', 'updatedAt', 'createdAt']
        }),
        Offer.findAll({
            include: [{ model: Project, as: 'project', where: { userId }, attributes: ['id', 'name'], required: true }],
            order: [['updatedAt', 'DESC']],
            attributes: ['id', 'offerNumber', 'status', 'grandTotal', 'updatedAt', 'createdAt', 'projectId']
        })
    ]);

    const recentProjects = projects.slice(0, RECENT_LIMIT).map(p => {
        const po = p.toJSON();
        return {
            id: po.id,
            title: po.name,
            buildingTypeName: po.buildingType?.name || null,
            updatedAt: po.updatedAt,
            createdAt: po.createdAt
        };
    });

    const offerCountByStatus = { draft: 0, in_progress: 0, offer_ready: 0, waiting: 0, ordered: 0, cancelled: 0 };
    offers.forEach(o => {
        const s = (o.status || 'draft').toLowerCase().replace(/-/g, '_');
        if (offerCountByStatus[s] !== undefined) offerCountByStatus[s]++;
        else offerCountByStatus.draft++;
    });

    const recentOffers = offers.slice(0, RECENT_LIMIT).map(o => {
        const oo = o.toJSON();
        return {
            id: oo.id,
            offerNumber: oo.offerNumber,
            status: oo.status || 'draft',
            grandTotal: oo.grandTotal,
            projectName: oo.project?.name || null,
            updatedAt: oo.updatedAt,
            createdAt: oo.createdAt
        };
    });

    const now = new Date();
    const reminderCutoff = new Date(now.getTime() + REMINDER_DAYS_AHEAD * 24 * 60 * 60 * 1000);
    const followups = await OfferFollowup.findAll({
        where: { enabled: true, nextReminderAt: { [Op.lte]: reminderCutoff, [Op.ne]: null } },
        include: [{ model: Offer, as: 'offer', include: [{ model: Project, as: 'project', where: { userId }, attributes: ['id', 'name'], required: true }], attributes: ['id', 'offerNumber', 'status'] }],
        order: [['nextReminderAt', 'ASC']],
        limit: 10
    });

    const reminders = followups
        .filter(f => f.offer?.project)
        .map(f => ({
            id: f.id,
            offerId: f.offer.id,
            offerNumber: f.offer.offerNumber,
            nextReminderAt: f.nextReminderAt,
            reason: f.reason || 'Follow-up reminder'
        }));

    return {
        user: userSummary || null,
        stats: {
            activeProjects: projects.length,
            draftOffers: offerCountByStatus.draft,
            inProgressOffers: offerCountByStatus.in_progress,
            offerReady: offerCountByStatus.offer_ready,
            waitingOffers: offerCountByStatus.waiting,
            orderedOffers: offerCountByStatus.ordered,
            cancelledOffers: offerCountByStatus.cancelled
        },
        recentProjects,
        recentOffers,
        reminders
    };
};
