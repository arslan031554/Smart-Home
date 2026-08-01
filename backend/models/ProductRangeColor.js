import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class ProductRangeColor extends Model {}

ProductRangeColor.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productRangeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ProductRanges', key: 'id' },
        field: 'product_range_id'
    },
    colorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Colors', key: 'id' },
        field: 'color_id'
    }
}, {
    sequelize,
    modelName: 'ProductRangeColor',
    tableName: 'ProductRangeColors',
    timestamps: true
});

ProductRangeColor.associate = (models) => {
    ProductRangeColor.belongsTo(models.ProductRange, { foreignKey: 'productRangeId', as: 'productRange' });
    ProductRangeColor.belongsTo(models.Color, { foreignKey: 'colorId', as: 'color' });
};

export default ProductRangeColor;
