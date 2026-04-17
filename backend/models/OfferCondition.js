import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class OfferCondition extends Model {}

OfferCondition.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    translations: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'OfferCondition',
    tableName: 'OfferConditions',
    timestamps: true
});

export default OfferCondition;
