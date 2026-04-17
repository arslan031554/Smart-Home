'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('Colors');
        if (!table.hex) {
            await queryInterface.addColumn('Colors', 'hex', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        }
    },

    async down(queryInterface) {
        const table = await queryInterface.describeTable('Colors');
        if (table.hex) {
            await queryInterface.removeColumn('Colors', 'hex');
        }
    },
};
