import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class ProductRangeProduct extends Model {}

// No field mapping: use default column names (productId, productRangeId) so they match
// Sequelize-created tables. If your DB has snake_case columns, add field: 'product_id' etc.
ProductRangeProduct.init({
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' }
    },
    productRangeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ProductRanges', key: 'id' }
    }
}, {
    sequelize,
    modelName: 'ProductRangeProduct',
    tableName: 'ProductRangeProducts',
    timestamps: false
});

export default ProductRangeProduct;
