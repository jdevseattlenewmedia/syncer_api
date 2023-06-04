import { Router } from "express";
import IndexController from "../controllers/index.controller";
import { Routes } from "@interfaces/routes.interface";
import db from "../models";

class IndexRoute implements Routes {
  public path = "/";
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.indexController.index);
    this.router.get(
      `${this.path}cron/airtable/reset_tokens`,
      this.indexController.refreshAirTablesGlobalTokenAndUpdate
    );
    this.router.get("/db_sync", async (_req, response) => {
      await db.PricingPlan.drop({ cascade: true });
      // await db.sequelize.drop(db.PricingPlan);
      /* `await db.sequelize.sync({ alter: true });` is synchronizing the database schema with the
      models defined in the code. The `alter: true` option is used to alter the existing tables in
      the database to match the models defined in the code. This means that any changes made to the
      models will be reflected in the database schema without dropping and recreating the tables.
      This is useful during development when the database schema is frequently changing and there is
      existing data in the tables that should not be lost. However, it should be used with caution
      in production environments as it can result in data loss if not used properly. */
      await db.sequelize.sync({ alter: true });
      await db.PricingPlan.createPricingPlansIfNotExists();
      await db.Service.createServiceNotExisists();
      response.send({
        message: "Database synced successfully",
      });
    });
    this.router.get("/db_sync_clear_all", async (_req, response) => {
      /* `await db.sequelize.sync({ force: true });` is dropping all existing tables in the database
      and recreating them based on the models defined in the code. The `force: true` option is used
      to force the synchronization process, which means that it will drop all existing tables and
      recreate them. This is useful during development when the database schema is frequently
      changing. However, it should be used with caution in production environments as it can result
      in data loss. */
      await db.sequelize.sync({ force: true });
      await db.PricingPlan.createPricingPlansIfNotExists();
      await db.Service.createServiceNotExisists();
      response.send({
        message: "Database synced successfully",
      });
    });
  }
}

export default IndexRoute;
