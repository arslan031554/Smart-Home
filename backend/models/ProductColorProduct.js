import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class ProductColorProduct extends Model {}

// No field mapping: use default column names (productId, colorId) to match Sequelize-created tables.
ProductColorProduct.init({
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' }
    },
    colorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Colors', key: 'id' }
    }
}, {
    sequelize,
    modelName: 'ProductColorProduct',
    tableName: 'ProductColorProducts',
    timestamps: false
});

export default ProductColorProduct;
