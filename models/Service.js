"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.hasMany(models.ConnectedService, { foreignKey: "serviceId" });
    }

    static async createServiceNotExisists(planNames) {
      const defaultServices = [
        {
          name: "airtable",
          clientId: "adefad8c-6879-4080-8e75-614ce5319f21",
          clientSecret:
            "55a11530d29565bc5d8b74389989443bb8caab20dc9af8d23e0e92a76acc14eb",
          // https://airtable.com/create/oauth/oapkWOEPkGKVODidR
          authUrl: "",
          tokenUrl: "",
          redirectUrl:
            "https://webflow-automation.vercel.app/airtable/callback",
          // redirectUrl: "http://localhost:8080/airtable/callback",
          scope:
            "schema.bases:read data.records:read data.recordComments:read webhook:manage",
        },
        {
          name: "webflow",
          apiKey: "",
          clientId:
            "b595d29da7b6f20929a25b605b814bc17403ee8ea7ba811a8e937b364579b7cc",
          clientSecret:
            "0475349cf83309d49eefd74c97686d489137327870dfc8d0787345475b059fb2",
          //https://webflow.com/dashboard/workspace/jijins-workspace-d09677/integrations
          authUrl: "",
          tokenUrl: "",
          redirectUrl: "https://webflow-automation.vercel.app/webflow/callback",
          // redirectUrl: "http://localhost:3000/webflow/callback",
          // redirectUrl: "http://localhost:3000/webflow/callback",
          scope: "",
        },
      ];
      for (let i = 0; i < defaultServices.length; i++) {
        const currentService = defaultServices[i];
        const [service, created] = await Service.findOrCreate({
          where: {
            name: currentService.name,
          },
          defaults: {
            ...currentService,
          },
        });
        if (created) {
          console.log(`Created: ${service.name}`);
        } else {
          console.log(`${service.name} already exists`);
        }
      }
    }
  }

  Service.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      apiKey: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      clientId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      clientSecret: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      authUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tokenUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      redirectUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      scope: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // apiKey: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // apiSecret: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // refreshToken: {
      //   type: DataTypes.STRING,
      // },
    },
    {
      sequelize,
      modelName: "Service",
      paranoid: true,
    }
  );

  return Service;
};
