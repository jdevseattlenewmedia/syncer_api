"use strict";
const { Model } = require("sequelize");
// Enumeration of subscription types
const SubscriptionType = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
};

// Enumeration of subscription statuses
const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
};
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.User, { foreignKey: "userId" });
      Subscription.belongsTo(models.PricingPlan, {
        foreignKey: "pricingPlanId",
      });
    }
  }
  Subscription.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(SubscriptionType)),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SubscriptionStatus)),
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pricingPlanId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Subscription",
      paranoid: true,
    }
  );
  return Subscription;
};
