import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import routes from './routes/index.js';
import notFound from './middlewares/notFoundmiddleware.js';
import errorHandler from './middlewares/errormiddleware.js';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

function getAllowedOrigins() {
    return [...new Set([
        process.env.FRONTEND_URL,
        ...(process.env.CORS_ORIGIN || '').split(',')
    ]
        .map((origin) => origin?.trim())
        .filter(Boolean)
        .map((origin) => origin.replace(/\/$/, '')))];
}

function isLocalDevOrigin(origin = '') {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(String(origin).trim());
}

function isOriginAllowed(origin = '') {
    const normalizedOrigin = String(origin || '').trim().replace(/\/$/, '');
    if (!normalizedOrigin) return true;
    if (isLocalDevOrigin(normalizedOrigin)) return true;
    return getAllowedOrigins().includes(normalizedOrigin);
}

function applyCorsHeaders(req, res) {
    const origin = req.headers.origin;
    if (origin && isOriginAllowed(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept-Language, x-guest-session-id');
}

const corsOptions = {
    origin(origin, callback) {
        if (!origin || isOriginAllowed(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'x-guest-session-id'],
    optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
    applyCorsHeaders(req, res);
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Basic rate limiting (tight for auth, mild for API)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1200,
    standardHeaders: 'draft-7',
    legacyHeaders: false
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.use('/api', routes);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Smart Home Configurator Backend is running'
    });
});

app.use(notFound);
app.use(errorHandler);

export default app;
