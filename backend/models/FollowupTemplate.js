import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class FollowupTemplate extends Model {}

FollowupTemplate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    channel: {
      type: DataTypes.ENUM('email', 'sms'),
      allowNull: false,
    },
    step: {
      // 1 = first reminder, 2 = second, 3 = third...
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    language: {
      // minimum requirements mention RO/EN
      type: DataTypes.ENUM('en', 'ro'),
      allowNull: false,
      defaultValue: 'en',
    },
    subject: {
      // email only; ignored for sms
      type: DataTypes.STRING,
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FollowupTemplate',
    tableName: 'FollowupTemplates',
    timestamps: true,
  }
);

export default FollowupTemplate;

