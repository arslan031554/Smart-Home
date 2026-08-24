import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class ProjectRoom extends Model {}

ProjectRoom.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    projectLevelId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ProjectLevels',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    roomTypeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'RoomTypes',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
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
    roomCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    sequelize,
    modelName: 'ProjectRoom',
    tableName: 'ProjectRooms',
    timestamps: true
});

ProjectRoom.associate = (models) => {
    ProjectRoom.belongsTo(models.ProjectLevel, { foreignKey: 'projectLevelId', as: 'level' });
    ProjectRoom.belongsTo(models.RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });
    ProjectRoom.hasMany(models.RoomFunctionSelection, { foreignKey: 'projectRoomId', as: 'functionSelections' });
};

export default ProjectRoom;
