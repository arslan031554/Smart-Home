import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class BuildingTypeRoomType extends Model {}

BuildingTypeRoomType.init({
    buildingTypeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'BuildingTypes', key: 'id' }
    },
    roomTypeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'RoomTypes', key: 'id' }
    }
}, {
    sequelize,
    modelName: 'BuildingTypeRoomType',
    tableName: 'BuildingTypeRoomTypes',
    timestamps: false
});

export default BuildingTypeRoomType;
