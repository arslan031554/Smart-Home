import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class BuildingType extends Model {}

BuildingType.init({
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
    modelName: 'BuildingType',
    tableName: 'BuildingTypes',
    timestamps: true
});

BuildingType.associate = (models) => {
    BuildingType.belongsToMany(models.RoomType, {
        through: models.BuildingTypeRoomType,
        foreignKey: 'buildingTypeId',
        as: 'roomTypes'
    });
};

export default BuildingType;
