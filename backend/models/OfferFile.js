import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class OfferFile extends Model {}

OfferFile.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    fileType: {
        type: DataTypes.ENUM('pdf', 'excel'),
        allowNull: false,
    },
    originalFilename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    generatedFilename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    storagePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    offerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Offers',
            key: 'id',
        },
    },
    projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'OfferFile',
    tableName: 'OfferFiles',
    timestamps: true,
});

OfferFile.associate = (models) => {
    OfferFile.belongsTo(models.Offer, { foreignKey: 'offerId', as: 'offer' });
    OfferFile.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    OfferFile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

export default OfferFile;
