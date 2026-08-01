import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class OfferProduct extends Model {}

OfferProduct.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    offerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Offers',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    productCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rangeName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    colorName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    unitPrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    subtotal: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    lineType: {
        type: DataTypes.ENUM('STANDARD', 'RELATED'),
        allowNull: false,
        defaultValue: 'STANDARD'
    }
}, {
    sequelize,
    modelName: 'OfferProduct',
    tableName: 'OfferProducts',
    timestamps: true
});

export default OfferProduct;
