import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class FollowupLog extends Model {}

FollowupLog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    context: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    offerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Offers',
            key: 'id',
        },
    },
    configuratorDraftId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'ConfiguratorDrafts',
            key: 'id',
        },
    },
    projectId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Projects',
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    channel: {
        type: DataTypes.ENUM('email', 'sms'),
        allowNull: false,
    },
    reminderStep: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    cadenceDay: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    templateId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'FollowupTemplates',
            key: 'id',
        },
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'sent',
    },
    target: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    providerMessageId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    deliveryMeta: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'FollowupLog',
    tableName: 'FollowupLogs',
    timestamps: true,
});

FollowupLog.associate = (models) => {
    FollowupLog.belongsTo(models.Offer, { foreignKey: 'offerId', as: 'offer' });
    FollowupLog.belongsTo(models.ConfiguratorDraft, { foreignKey: 'configuratorDraftId', as: 'configuratorDraft' });
    FollowupLog.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    FollowupLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    FollowupLog.belongsTo(models.FollowupTemplate, { foreignKey: 'templateId', as: 'template' });
};

export default FollowupLog;

