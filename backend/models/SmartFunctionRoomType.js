import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class SmartFunctionRoomType extends Model {}

SmartFunctionRoomType.init({
    smartFunctionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'SmartFunctions',
            key: 'id'
        }
    },
    roomTypeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'RoomTypes',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'SmartFunctionRoomType',
    tableName: 'SmartFunctionRoomTypes',
    timestamps: false
});

export default SmartFunctionRoomType;
