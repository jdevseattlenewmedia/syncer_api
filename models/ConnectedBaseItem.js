"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ConnectedBaseItem extends Model {
    static associate(models) {
      ConnectedBaseItem.belongsTo(models.ConnectedBase, {
        foreignKey: "connectedBaseId",
      });
    }
  }

  ConnectedBaseItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      connectedBaseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sourceFiledId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      targetFiledId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isSourceFieldActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isTargetFieldActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ConnectedBaseItem",
      paranoid: true,
    }
  );
  return ConnectedBaseItem;
};
