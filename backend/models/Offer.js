import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class Offer extends Model {}

Offer.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'id'
        }
    },
    offerNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'in_progress', 'offer_ready', 'waiting', 'ordered', 'cancelled'),
        defaultValue: 'draft'
    },
    customerComments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    productsSubtotal: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    servicesSubtotal: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    discountPercent: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    discountAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    grandTotal: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    generatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    calculationSnapshot: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Offer',
    tableName: 'Offers',
    timestamps: true
});

Offer.associate = (models) => {
    Offer.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    Offer.hasMany(models.OfferProduct, { foreignKey: 'offerId', as: 'products' });
    Offer.hasMany(models.OfferService, { foreignKey: 'offerId', as: 'services' });
    Offer.hasOne(models.OfferFollowup, { foreignKey: 'offerId', as: 'followup' });
};

export default Offer;
