import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class Disclaimer extends Model {}

Disclaimer.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    translations: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Disclaimer',
    tableName: 'Disclaimers',
    timestamps: true
});

export default Disclaimer;
