'use strict';

/** Rename ProductFunctionMappings columns to snake_case so Sequelize (underscored: true) finds them in PostgreSQL. */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = 'ProductFunctionMappings';
        const dialect = queryInterface.sequelize.getDialect();
        if (dialect !== 'postgres') return;

        const renames = [
            ['productId', 'product_id'],
            ['smartFunctionId', 'smart_function_id'],
            ['channelType', 'channel_type'],
            ['calculationScope', 'calculation_scope'],
            ['isActive', 'is_active'],
        ];

        for (const [oldName, newName] of renames) {
            try {
                await queryInterface.renameColumn(table, oldName, newName);
            } catch (e) {
                const msg = e.message || '';
                if (msg.includes('does not exist')) continue;
                if (msg.includes('already exists')) continue;
                throw e;
            }
        }
    },

    async down(queryInterface, Sequelize) {
        const table = 'ProductFunctionMappings';
        const dialect = queryInterface.sequelize.getDialect();
        if (dialect !== 'postgres') return;

        const renames = [
            ['product_id', 'productId'],
            ['smart_function_id', 'smartFunctionId'],
            ['channel_type', 'channelType'],
            ['calculation_scope', 'calculationScope'],
            ['is_active', 'isActive'],
        ];

        for (const [oldName, newName] of renames) {
            try {
                await queryInterface.renameColumn(table, oldName, newName);
            } catch (e) {
                const msg = e.message || '';
                if (msg.includes('does not exist')) continue;
                if (msg.includes('already exists')) continue;
                throw e;
            }
        }
    }
};
