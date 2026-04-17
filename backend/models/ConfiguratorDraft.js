import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class ConfiguratorDraft extends Model {}

ConfiguratorDraft.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    guestSessionId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    snapshot: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
    },
    configurationStatus: {
        type: DataTypes.ENUM('active', 'completed', 'converted'),
        allowNull: false,
        defaultValue: 'active',
    },
    convertedOfferId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    channelEmail: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    channelSms: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    lastActivityAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    lastReminderAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    nextReminderAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    pattern: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'unfinished_configuration',
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
    },
    lastStep: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    language: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'en',
    },
    source: {
        type: DataTypes.ENUM('guest', 'account'),
        allowNull: false,
        defaultValue: 'account',
    },
}, {
    sequelize,
    modelName: 'ConfiguratorDraft',
    tableName: 'ConfiguratorDrafts',
    timestamps: true,
});

ConfiguratorDraft.associate = (models) => {
    ConfiguratorDraft.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

export default ConfiguratorDraft;
