import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class Color extends Model {}

Color.init({
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
    hex: {
        type: DataTypes.STRING,
        allowNull: true
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
    modelName: 'Color',
    tableName: 'Colors',
    timestamps: true
});

Color.associate = (models) => {
    Color.belongsToMany(models.Product, {
        through: models.ProductColorProduct,
        foreignKey: 'colorId',
        as: 'products'
    });
    Color.belongsToMany(models.ProductRange, {
        through: models.ProductRangeColor,
        foreignKey: 'colorId',
        otherKey: 'productRangeId',
        as: 'productRanges'
    });
};

export default Color;
