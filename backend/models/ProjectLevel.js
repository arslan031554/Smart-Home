import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class ProjectLevel extends Model {}

ProjectLevel.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    levelOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'ProjectLevel',
    tableName: 'ProjectLevels',
    timestamps: true
});

ProjectLevel.associate = (models) => {
    ProjectLevel.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    ProjectLevel.hasMany(models.ProjectRoom, { foreignKey: 'projectLevelId', as: 'rooms' });
};

export default ProjectLevel;
