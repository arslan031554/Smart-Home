/**
 * Seed test users for Smart Home Configurator.
 * Run from backend directory: node scripts/seed-test-users.js
 * Requires: .env with DB_* and JWT_SECRET.
 *
 * Test accounts:
 * - Admin:   admin@test.com   / Admin@12345   (verified)
 * - Customer: user@test.com   / User@12345    (verified)
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function seed() {
    // Load config and models (same as server)
    const sequelize = (await import('../src/config/database.js')).default;
    const models = (await import('../models/index.js')).default;
    const User = models.User;

    await sequelize.authenticate();
    console.log('Database connected.');

    const adminHash = await bcrypt.hash('Admin@12345', 10);
    const userHash = await bcrypt.hash('User@12345', 10);

    const testUsers = [
        { email: 'admin@test.com', passwordHash: adminHash, role: 'admin', isVerified: true, fullName: 'Test Admin' },
        { email: 'user@test.com', passwordHash: userHash, role: 'customer', isVerified: true, fullName: 'Test User', phone: '+15550000001' }
    ];

    for (const u of testUsers) {
        const [user, created] = await User.findOrCreate({
            where: { email: u.email },
            defaults: u
        });
        if (created) {
            console.log(`Created: ${u.email}`);
        } else {
            await user.update({
                passwordHash: u.passwordHash,
                isVerified: true,
                role: u.role,
                otpCode: null,
                otpExpiresAt: null,
                otpChannel: null
            });
            console.log(`Updated: ${u.email}`);
        }
    }

    console.log('Done. You can log in with admin@test.com / Admin@12345 or user@test.com / User@12345');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err.message || err);
    process.exit(1);
});
