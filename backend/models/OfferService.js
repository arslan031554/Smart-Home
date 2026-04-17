import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class OfferService extends Model {}

OfferService.init({
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
    serviceId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    serviceName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pricingMode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    calcQty: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    unitPrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    subtotal: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'OfferService',
    tableName: 'OfferServices',
    timestamps: true
});

export default OfferService;
