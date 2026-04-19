import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class SmartFunction extends Model {}

SmartFunction.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    inputChannelCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    outputChannelCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    generalChannelCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    translations: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    channelType: {
        type: DataTypes.ENUM('IN', 'OUT', 'GENERAL'),
        defaultValue: 'GENERAL'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'SmartFunction',
    tableName: 'SmartFunctions',
    timestamps: true
});

SmartFunction.associate = (models) => {
    SmartFunction.belongsToMany(models.RoomType, {
        through: models.SmartFunctionRoomType,
        foreignKey: 'smartFunctionId',
        as: 'roomTypes'
    });
    SmartFunction.belongsToMany(models.Product, {
        through: models.ProductFunctionMapping,
        foreignKey: 'smartFunctionId',
        otherKey: 'productId',
        as: 'products'
    });
    SmartFunction.belongsToMany(models.Service, {
        through: models.ServiceSmartFunction,
        foreignKey: 'smartFunctionId',
        as: 'services'
    });
    SmartFunction.hasMany(models.ProductFunctionMapping, { foreignKey: 'smartFunctionId', as: 'mappings' });
};

export default SmartFunction;
