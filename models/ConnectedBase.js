"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ConnectedBase extends Model {
    static associate(models) {
      ConnectedBase.belongsTo(models.Base, {
        foreignKey: "baseId",
      });
      ConnectedBase.belongsTo(models.ConnectedService, {
        foreignKey: "connectedServiceId",
        as: "connectedService",
      });
      ConnectedBase.belongsTo(models.ConnectedService, {
        foreignKey: "connectedServiceWebflowId",
        as: "connectedServiceWebflow",
      });
      ConnectedBase.hasMany(models.ConnectedBaseItem);
    }
  }

  ConnectedBase.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      baseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      connectedServiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      connectedServiceWebflowId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      toSyncData: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      selectedFieldMap: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ConnectedBase",
      paranoid: true,
    }
  );
  return ConnectedBase;
};
