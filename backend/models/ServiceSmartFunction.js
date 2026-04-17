import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class ServiceSmartFunction extends Model {}

ServiceSmartFunction.init({
    serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Services',
            key: 'id'
        }
    },
    smartFunctionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'SmartFunctions',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'ServiceSmartFunction',
    tableName: 'ServiceSmartFunctions',
    timestamps: false
});

export default ServiceSmartFunction;
