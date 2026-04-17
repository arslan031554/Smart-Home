import { DataTypes, Model } from 'sequelize';
import sequelize from '../src/config/database.js';

class User extends Model {}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin', 'employee'),
        defaultValue: 'customer'
    },
    employeeRole: {
        type: DataTypes.STRING,
        allowNull: true
    },
    permissions: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Customer profile fields
    fullName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    invoiceName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    invoiceVat: {
        type: DataTypes.STRING,
        allowNull: true
    },
    invoiceAddress: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    newsletterSubscribed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    termsAccepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    cookiesAccepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    otpCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    otpChannel: {
        type: DataTypes.ENUM('sms', 'email'),
        allowNull: true
    },
    lastLogoutAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    preferredLanguage: {
        type: DataTypes.ENUM('en', 'ro'),
        allowNull: false,
        defaultValue: 'en'
    },
    preferredVerificationChannel: {
        type: DataTypes.ENUM('email', 'sms'),
        allowNull: false,
        defaultValue: 'email'
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true
});

export default User;
