import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class Project extends Model {}

Project.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    buildingTypeId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'BuildingTypes',
            key: 'id'
        }
    },
    builtUpArea: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    levelsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    multiplicationIndex: {
        type: DataTypes.FLOAT,
        defaultValue: 1.0
    },
    projectComplexity: {
        type: DataTypes.STRING,
        allowNull: true
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
    translations: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    selectedRangeId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    selectedColorId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'active', 'archived'),
        defaultValue: 'draft'
    }
}, {
    sequelize,
    modelName: 'Project',
    tableName: 'Projects',
    timestamps: true
});

Project.associate = (models) => {
    Project.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Project.belongsTo(models.BuildingType, { foreignKey: 'buildingTypeId', as: 'buildingType' });
    Project.belongsTo(models.ProductRange, { foreignKey: 'selectedRangeId', as: 'range' });
    Project.belongsTo(models.Color, { foreignKey: 'selectedColorId', as: 'color' });
    Project.hasMany(models.ProjectLevel, { foreignKey: 'projectId', as: 'levels' });
    Project.hasMany(models.Offer, { foreignKey: 'projectId', as: 'offers' });
    Project.hasMany(models.OfferFile, { foreignKey: 'projectId', as: 'offerFiles' });
};

export default Project;
