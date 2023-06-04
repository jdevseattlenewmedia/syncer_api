import { Router } from "express";
import AirtableConnectionController from "../controllers/airtableConnection.controller";
import AirtableController from "../controllers/airtable.controller";
import { Routes } from "../interfaces/routes.interface";
import authMiddleware from "../middlewares/auth.middleware";

class AirtableConnectionsRoutes implements Routes {
  public path = "/airtable";
  public router = Router();
  public AirtableController = new AirtableController();
  public AirtableConnectionController = new AirtableConnectionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/authorize`,
      authMiddleware,
      this.AirtableConnectionController.authorize
    );
    this.router.post(
      `${this.path}/re_authorize`,
      authMiddleware,
      this.AirtableConnectionController.reAuthorize
    );
    this.router.get(
      `${this.path}/callback`, // front end alternate
      // authMiddleware,
      this.AirtableConnectionController.callback
    );
    this.router.post(
      `${this.path}/callback_verify`,
      authMiddleware,
      this.AirtableConnectionController.callbackVerify
    );
    this.router.get(
      `${this.path}/connected_list`,
      authMiddleware,
      this.AirtableConnectionController.getConnectedAirtableServices
    );
    this.router.post(
      `${this.path}/refresh`,
      authMiddleware,
      this.AirtableConnectionController.refreshTokenAndUpdate
    );

    // airtable apis
    this.router.get(
      `${this.path}/:id/bases`,
      authMiddleware,
      this.AirtableController.getBasesByConnectionId
    );
    // airtable apis
    this.router.get(
      `${this.path}/:id/bases/:baseId/tables`,
      authMiddleware,
      this.AirtableController.getTablesByBaseId
    );
    this.router.get(
      `${this.path}/:id/bases/:baseId/tables/:tableId`,
      authMiddleware,
      this.AirtableController.getTablesByBaseIdAndTableId
    );
     this.router.get(
      `${this.path}/me`,
      authMiddleware,
      this.AirtableController.getMeData
    );

    this.router.get(`${this.path}`, this.AirtableConnectionController.index);
  }
}

export default AirtableConnectionsRoutes;
