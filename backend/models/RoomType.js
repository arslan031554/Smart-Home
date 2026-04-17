import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class RoomType extends Model {}

RoomType.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    translations: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'RoomType',
    tableName: 'RoomTypes',
    timestamps: true
});

RoomType.associate = (models) => {
    RoomType.belongsToMany(models.SmartFunction, {
        through: models.SmartFunctionRoomType,
        foreignKey: 'roomTypeId',
        as: 'smartFunctions'
    });
    RoomType.belongsToMany(models.BuildingType, {
        through: models.BuildingTypeRoomType,
        foreignKey: 'roomTypeId',
        as: 'buildingTypes'
    });
};

export default RoomType;
