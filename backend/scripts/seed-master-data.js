/**
 * Idempotent master data seed script.
 * Run from backend: node scripts/seed-master-data.js
 * Requires: .env with DB_* and JWT_SECRET.
 * Loads: building types, room types, smart functions, product ranges, colors,
 *        offer conditions, disclaimers, discount rules, products, services, test users.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import {
    buildingTypes,
    roomTypes,
    smartFunctions,
    productRanges,
    colors,
    offerConditions,
    disclaimers,
    discountRules,
    products,
    services,
} from '../data/master-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
    const sequelize = (await import('../src/config/database.js')).default;
    const models = (await import('../models/index.js')).default;
    const {
        User,
        BuildingType,
        RoomType,
        SmartFunction,
        ProductRange,
        Color,
        OfferCondition,
        Disclaimer,
        DiscountRule,
        Product,
        Service,
    } = models;

    await sequelize.authenticate();
    console.log('Database connected.');

    for (const row of buildingTypes) {
        await BuildingType.findOrCreate({ where: { name: row.name }, defaults: row });
    }
    console.log(`Building types: ${buildingTypes.length}`);

    for (const row of roomTypes) {
        await RoomType.findOrCreate({ where: { name: row.name }, defaults: row });
    }
    console.log(`Room types: ${roomTypes.length}`);

    for (const row of smartFunctions) {
        await SmartFunction.findOrCreate({ where: { code: row.code }, defaults: row });
    }
    console.log(`Smart functions: ${smartFunctions.length}`);

    for (const row of productRanges) {
        await ProductRange.findOrCreate({ where: { name: row.name }, defaults: row });
    }
    console.log(`Product ranges: ${productRanges.length}`);

    for (const row of colors) {
        const [color, created] = await Color.findOrCreate({ where: { name: row.name }, defaults: row });
        if (!created) {
            await color.update({
                hex: row.hex ?? color.hex ?? null,
                isVisible: row.isVisible ?? color.isVisible,
                isActive: row.isActive ?? color.isActive,
            });
        }
    }
    console.log(`Colors: ${colors.length}`);

    for (const row of offerConditions) {
        const existing = await OfferCondition.findOne({ where: { text: row.text } });
        if (!existing) await OfferCondition.create({ text: row.text, order: row.order });
    }
    console.log(`Offer conditions: ${offerConditions.length}`);

    for (const row of disclaimers) {
        const existing = await Disclaimer.findOne({ where: { text: row.text } });
        if (!existing) await Disclaimer.create({ text: row.text, order: row.order });
    }
    console.log(`Disclaimers: ${disclaimers.length}`);

    for (const row of discountRules) {
        await DiscountRule.findOrCreate({
            where: { minMultiplier: row.minMultiplier, maxMultiplier: row.maxMultiplier },
            defaults: row,
        });
    }
    console.log(`Discount rules: ${discountRules.length}`);

    for (const row of products) {
        await Product.findOrCreate({ where: { code: row.code }, defaults: row });
    }
    console.log(`Products: ${products.length}`);

    for (const row of services) {
        await Service.findOrCreate({ where: { code: row.code }, defaults: row });
    }
    console.log(`Services: ${services.length}`);

    const adminHash = await bcrypt.hash('Admin@12345', 10);
    const userHash = await bcrypt.hash('User@12345', 10);
    const testUsers = [
        { email: 'admin@test.com', passwordHash: adminHash, role: 'admin', isVerified: true, fullName: 'Test Admin' },
        { email: 'user@test.com', passwordHash: userHash, role: 'customer', isVerified: true, fullName: 'Test User', phone: '+15550000001' },
    ];
    for (const u of testUsers) {
        const [user, created] = await User.findOrCreate({
            where: { email: u.email },
            defaults: u,
        });
        if (!created) {
            await user.update({
                passwordHash: u.passwordHash,
                isVerified: true,
                role: u.role,
                otpCode: null,
                otpExpiresAt: null,
                otpChannel: null,
            });
        }
    }
    console.log('Test users: admin@test.com / Admin@12345, user@test.com / User@12345');

    console.log('Master data seed done.');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err.message || err);
    process.exit(1);
});
