import { Router } from "express";
import DashboardController from "../controllers/dashboard.controller";

import { Routes } from "../interfaces/routes.interface";
// import validationMiddleware from "../middlewares/validation.middleware";
import authMiddleware from "../middlewares/auth.middleware";

class DashboardRoutes implements Routes {
  public path = "/dashboard";
  public router = Router();
  public dashboardController = new DashboardController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/list`,
      authMiddleware,
      // validationMiddleware(CreateUserDto, "body"),
      this.dashboardController.index
    );
  }
}

export default DashboardRoutes;
