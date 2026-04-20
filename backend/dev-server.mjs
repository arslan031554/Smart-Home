import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const preferredEnvPath = path.join(__dirname, '.env.development');
const fallbackEnvPath = path.join(__dirname, '.env');

dotenv.config({
  path: fs.existsSync(preferredEnvPath) ? preferredEnvPath : fallbackEnvPath,
  override: true,
});

process.env.NODE_ENV = 'development';

await import('./src/server.js');
