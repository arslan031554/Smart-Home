import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class Product extends Model {}

Product.init({
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    translations: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    unitPriceEurExVat: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            isFloat: {
                args: { min: Number.EPSILON },
                msg: 'Price must be a number greater than 0'
            }
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Product',
    tableName: 'Products',
    timestamps: true
});

Product.associate = (models) => {
    Product.belongsToMany(models.ProductRange, {
        through: models.ProductRangeProduct,
        foreignKey: 'productId',
        otherKey: 'productRangeId',
        as: 'productRanges'
    });
    Product.belongsToMany(models.Color, {
        through: models.ProductColorProduct,
        foreignKey: 'productId',
        otherKey: 'colorId',
        as: 'colors'
    });
    Product.belongsToMany(models.SmartFunction, {
        through: models.ProductFunctionMapping,
        foreignKey: 'productId',
        otherKey: 'smartFunctionId',
        as: 'smartFunctions'
    });
    Product.hasMany(models.ProductFunctionMapping, { foreignKey: 'productId', as: 'mappings' });
};

export default Product;
