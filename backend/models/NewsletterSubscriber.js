import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class NewsletterSubscriber extends Model {}

NewsletterSubscriber.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'footer',
    },
    subscribedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'NewsletterSubscriber',
    tableName: 'NewsletterSubscribers',
    timestamps: true,
});

export default NewsletterSubscriber;
