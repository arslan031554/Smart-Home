import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class Service extends Model {}

Service.init({
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
    pricingMode: {
        type: DataTypes.ENUM('fixed_project', 'per_room', 'per_level', 'per_product_qty', 'per_function_qty'),
        defaultValue: 'fixed_project'
    },
    unitPriceEurExVat: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    isOptionalForCustomer: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Service',
    tableName: 'Services',
    timestamps: true
});

Service.associate = (models) => {
    Service.belongsToMany(models.SmartFunction, {
        through: models.ServiceSmartFunction,
        foreignKey: 'serviceId',
        as: 'smartFunctions'
    });
};

export default Service;
