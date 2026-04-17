import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class RoomFunctionSelection extends Model {}

RoomFunctionSelection.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    projectRoomId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ProjectRooms',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    smartFunctionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'SmartFunctions',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    sequelize,
    modelName: 'RoomFunctionSelection',
    tableName: 'RoomFunctionSelections',
    timestamps: true
});

RoomFunctionSelection.associate = (models) => {
    RoomFunctionSelection.belongsTo(models.ProjectRoom, { foreignKey: 'projectRoomId', as: 'room' });
    RoomFunctionSelection.belongsTo(models.SmartFunction, { foreignKey: 'smartFunctionId', as: 'smartFunction' });
};

export default RoomFunctionSelection;
