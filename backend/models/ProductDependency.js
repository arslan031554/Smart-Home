import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class ProductDependency extends Model {}

ProductDependency.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    mainProductId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        field: 'main_product_id'
    },
    relatedProductId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        field: 'related_product_id'
    },
    quantityPerMainProduct: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1,
        field: 'quantity_per_main_product',
        validate: {
            min: 0.000001
        }
    }
}, {
    sequelize,
    modelName: 'ProductDependency',
    tableName: 'ProductDependencies',
    timestamps: true
});

ProductDependency.associate = (models) => {
    ProductDependency.belongsTo(models.Product, { foreignKey: 'mainProductId', as: 'mainProduct' });
    ProductDependency.belongsTo(models.Product, { foreignKey: 'relatedProductId', as: 'relatedProduct' });
};

export default ProductDependency;
