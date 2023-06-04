"use strict";
const { Model } = require("sequelize");

// Enumeration of pricing plan names
const PricingPlanName = {
  FREE: "FREE",
  PRO: "PRO",
  LITE: "LITE",
};

module.exports = (sequelize, DataTypes) => {
  class PricingPlan extends Model {
    super() {
      this.PricingPlanName = PricingPlanName;
    }
    static associate(models) {
      PricingPlan.hasMany(models.Subscription, { foreignKey: "pricingPlanId" });
    }

    static async createPricingPlansIfNotExists(planNames) {
      let plans = planNames || Object.values(PricingPlanName);
      for (let i = 0; i < plans.length; i++) {
        const planName = plans[i];
        const [pricingPlan, created] = await PricingPlan.findOrCreate({
          where: {
            name: planName,
          },
          defaults: {
            name: planName,
          },
        });
        if (created) {
          console.log(`Created pricing plan: ${pricingPlan.name}`);
        } else {
          console.log(`Pricing plan ${pricingPlan.name} already exists`);
        }
      }
    }

    getPricingPlanNamesObject() {
      return PricingPlanName;
    }
  }

  PricingPlan.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.ENUM(...Object.values(PricingPlanName)),
        allowNull: false,
        unique: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "PricingPlan",
    }
  );
  return PricingPlan;
};
