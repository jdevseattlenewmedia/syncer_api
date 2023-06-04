"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Base extends Model {
    static associate(models) {
      Base.hasMany(models.ConnectedBase);
      Base.belongsTo(models.User, { foreignKey: "userId" });
    }
  }

  Base.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      baseName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      enableAutoSync: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      isSyncing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lastSyncStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
      lastSyncedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        // get() {
        //   return this.getDataValue("lastSynced");
        // },
      },
    },
    {
      sequelize,
      modelName: "Base",
      paranoid: true,
    }
  );
  return Base;
};
