import { DataTypes } from 'sequelize';
import sequelize from '../src/config/database.js';

const PortfolioProject = sequelize.define('PortfolioProject', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    result: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    images: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    tableName: 'PortfolioProjects',
    timestamps: true,
});

export default PortfolioProject;
