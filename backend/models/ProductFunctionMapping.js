import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class ProductFunctionMapping extends Model {}

ProductFunctionMapping.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        field: 'product_id'
    },
    smartFunctionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'SmartFunctions', key: 'id' },
        field: 'smart_function_id'
    },
    channelType: {
        type: DataTypes.ENUM('IN', 'OUT', 'GENERAL'),
        defaultValue: 'GENERAL',
        field: 'channel_type'
    },
    capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    calculationScope: {
        type: DataTypes.ENUM('room', 'level', 'project'),
        defaultValue: 'room',
        field: 'calculation_scope'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    sequelize,
    modelName: 'ProductFunctionMapping',
    tableName: 'ProductFunctionMappings',
    timestamps: true
});

ProductFunctionMapping.associate = (models) => {
    ProductFunctionMapping.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    ProductFunctionMapping.belongsTo(models.SmartFunction, { foreignKey: 'smartFunctionId', as: 'smartFunction' });
};

export default ProductFunctionMapping;
