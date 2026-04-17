import sequelize from './config/database.js';

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful');
        process.exit(0);
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
})();