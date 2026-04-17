import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class DiscountRule extends Model {}

DiscountRule.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    minMultiplier: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    maxMultiplier: {
        type: DataTypes.FLOAT,
        defaultValue: 1000
    },
    discountPercent: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'DiscountRule',
    tableName: 'DiscountRules',
    timestamps: true
});

export default DiscountRule;
