import { Router } from "express";
import BasesController from "../controllers/bases.controller";
import { Routes } from "../interfaces/routes.interface";
import authMiddleware from "../middlewares/auth.middleware";

class BasesRoutes implements Routes {
  public path = "/bases";
  public router = Router();
  public BasesController = new BasesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.BasesController.listAll
    );
    this.router.post(
      `${this.path}/airtable`,
      authMiddleware,
      this.BasesController.createNewAirtableWebflowSync
    );

    this.router.put(
      `${this.path}/auto_sync`,
      authMiddleware,
      this.BasesController.updateEnableAutoSync
    );

    this.router.post(
      `${this.path}/manual_sync`,
      authMiddleware,
      this.BasesController.manualSync
    );

    // this.router.get(`${this.path}`, this.BasesController.index);
  }
}

export default BasesRoutes;
