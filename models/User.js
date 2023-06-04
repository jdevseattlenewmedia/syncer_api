"use strict";
const { Model } = require("sequelize");
// User roles
const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  ADMIN_STAFF: "ADMIN_STAFF",
};

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Subscription, { foreignKey: "userId" });
      User.hasMany(models.Product, { foreignKey: "userId" });
      User.hasMany(models.ConnectedService, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      cognitoUserId: {
        type: DataTypes.STRING,
        index: true, // add index
        unique: true,
        // allowNull: true,
        // defaultValue: null,
      },
      cognitoUserName: {
        type: DataTypes.STRING,
        unique: true,
        index: true, // add index

        // allowNull: true,
        // defaultValue: null,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      role: {
        type: DataTypes.ENUM(...Object.values(UserRole)),
        defaultValue: UserRole.USER,
      },
    },
    {
      sequelize,
      modelName: "User",
      paranoid: true,
    }
  );
  return User;
};
