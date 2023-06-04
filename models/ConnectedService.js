"use strict";
const { Model } = require("sequelize");

const connectionsStatuses = {
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  ERROR: "ERROR",
  INPROGRESS: "INPROGRESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  EXPIERED: "EXPIRED",
};
module.exports = (sequelize, DataTypes) => {
  class ConnectedService extends Model {
    static associate(models) {
      ConnectedService.belongsTo(models.User, { foreignKey: "userId" });
      ConnectedService.belongsTo(models.Service, {
        foreignKey: "serviceId",
      });
      ConnectedService.hasMany(models.ConnectedBase);
    }
  }

  ConnectedService.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      // service: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      codeVerifier: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accessToken: {
        type: DataTypes.STRING(2048),
        allowNull: true,
      },
      refreshToken: {
        type: DataTypes.STRING(2048),
        allowNull: true,
      },
      tokenType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      scope: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiresIn: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      refreshExpiresIn: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isConnected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comments: "Is the service connected to the user?",
      },
      currentStatus: {
        type: DataTypes.ENUM(...Object.values(connectionsStatuses)),
        allowNull: true,
        defaultValue: "INPROGRESS",
        comments: "Current status of the connection",
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
    },
    {
      sequelize,
      modelName: "ConnectedService",
      paranoid: true,
    }
  );
  return ConnectedService;
};
