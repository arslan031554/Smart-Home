import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class ProductRange extends Model {}

ProductRange.init({
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
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    priceMultiplier: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.0
    },
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'ProductRange',
    tableName: 'ProductRanges',
    timestamps: true
});

ProductRange.associate = (models) => {
    ProductRange.belongsToMany(models.Product, {
        through: models.ProductRangeProduct,
        foreignKey: 'productRangeId',
        as: 'products'
    });
};

export default ProductRange;
