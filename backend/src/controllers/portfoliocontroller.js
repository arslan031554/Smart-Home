import models from '../../models/index.js';

const { PortfolioProject } = models;

// --- Admin Handlers ---

export const getAllAdmin = async (req, res, next) => {
    try {
        const projects = await PortfolioProject.findAll({
            order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
};

export const getOneAdmin = async (req, res, next) => {
    try {
        const project = await PortfolioProject.findByPk(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Portfolio project not found' });
        res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

export const createAdmin = async (req, res, next) => {
    try {
        const project = await PortfolioProject.create(req.body);
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

export const updateAdmin = async (req, res, next) => {
    try {
        const project = await PortfolioProject.findByPk(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Portfolio project not found' });
        
        await project.update(req.body);
        res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};

export const deleteAdmin = async (req, res, next) => {
    try {
        const project = await PortfolioProject.findByPk(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Portfolio project not found' });
        
        await project.destroy();
        res.json({ success: true, message: 'Portfolio project deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const uploadImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded' });
        }
        
        const uploadedUrls = req.files.map(file => {
            const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
            return `${baseUrl}/uploads/portfolio/${file.filename}`;
        });
        
        res.json({ success: true, data: { imageUrls: uploadedUrls } });
    } catch (error) {
        next(error);
    }
};

// --- Public Handlers ---

export const getAllPublic = async (req, res, next) => {
    try {
        const projects = await PortfolioProject.findAll({
            where: { isActive: true },
            order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
};

export const getOnePublic = async (req, res, next) => {
    try {
        const project = await PortfolioProject.findOne({
            where: { id: req.params.id, isActive: true }
        });
        if (!project) return res.status(404).json({ success: false, message: 'Portfolio project not found' });
        res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
};
