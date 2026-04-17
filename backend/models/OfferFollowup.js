import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class OfferFollowup extends Model {}

OfferFollowup.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    offerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Offers',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    channelEmail: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    channelSms: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastReminderAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    nextReminderAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    pattern: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
    },
    snoozedUntil: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'OfferFollowup',
    tableName: 'OfferFollowups',
    timestamps: true
});

OfferFollowup.associate = (models) => {
    OfferFollowup.belongsTo(models.Offer, { foreignKey: 'offerId', as: 'offer' });
};

export default OfferFollowup;
