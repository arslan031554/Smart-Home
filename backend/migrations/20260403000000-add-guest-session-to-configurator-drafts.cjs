'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('ConfiguratorDrafts', 'userId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    }).catch(() => {});

    await queryInterface.addColumn('ConfiguratorDrafts', 'guestSessionId', {
      type: Sequelize.STRING,
      allowNull: true,
    }).catch(() => {});

    await queryInterface.addColumn('ConfiguratorDrafts', 'lastStep', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    }).catch(() => {});

    await queryInterface.addColumn('ConfiguratorDrafts', 'language', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'en',
    }).catch(() => {});

    await queryInterface.addColumn('ConfiguratorDrafts', 'source', {
      type: Sequelize.ENUM('guest', 'account'),
      allowNull: false,
      defaultValue: 'account',
    }).catch(() => {});

    await queryInterface.addIndex('ConfiguratorDrafts', ['guestSessionId'], {
      name: 'configurator_drafts_guest_session_idx',
    }).catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('ConfiguratorDrafts', 'userId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    }).catch(() => {});
    await queryInterface.removeIndex('ConfiguratorDrafts', 'configurator_drafts_guest_session_idx').catch(() => {});
    await queryInterface.removeColumn('ConfiguratorDrafts', 'guestSessionId').catch(() => {});
    await queryInterface.removeColumn('ConfiguratorDrafts', 'lastStep').catch(() => {});
    await queryInterface.removeColumn('ConfiguratorDrafts', 'language').catch(() => {});
    await queryInterface.removeColumn('ConfiguratorDrafts', 'source').catch(() => {});
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ConfiguratorDrafts_source";').catch(() => {});
  },
};
