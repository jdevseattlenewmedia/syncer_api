import { Router } from "express";
import WebflowConnectionController from "../controllers/webflowConnection.controller";
import WebflowController from "../controllers/webflow.controller";
import { Routes } from "../interfaces/routes.interface";
import authMiddleware from "../middlewares/auth.middleware";

class AirtableConnectionsRoutes implements Routes {
  public path = "/webflow";
  public router = Router();
  public WebflowConnectionController = new WebflowConnectionController();
  public WebflowController = new WebflowController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/authorize`,
      authMiddleware,
      this.WebflowConnectionController.authorize
    );
    //  this.router.post(
    //    `${this.path}/re_authorize`,
    //    authMiddleware,
    //    this.WebflowConnectionController.reAuthorize
    //  );
    this.router.get(
      `${this.path}/callback`, // front end alternate
      // authMiddleware,
      this.WebflowConnectionController.callback
    );
    this.router.post(
      `${this.path}/callback_verify`,
      authMiddleware,
      this.WebflowConnectionController.getAccessToken
    );
    this.router.get(
      `${this.path}/connected_list`,
      authMiddleware,
      this.WebflowConnectionController.getConnectedWebFlowServices
    );
    this.router.get(
      `${this.path}/revoke-authorization`,
      authMiddleware,
      this.WebflowConnectionController.revokeAuthorization
    );

    //  this.router.post(
    //    `${this.path}/refresh`,
    //    authMiddleware,
    //    this.WebflowConnectionController.refreshTokenAndUpdate
    //  );

    // webflow apis
    this.router.get(
      `${this.path}/:id/sites`,
      authMiddleware,
      this.WebflowController.getSitesByConnectionId
    );
    this.router.get(
      `${this.path}/:id/sites/:siteId/collections`,
      authMiddleware,
      this.WebflowController.getSiteCollections
    );
    this.router.get(
      `${this.path}/:id/collections/:collectionId`,
      authMiddleware,
      this.WebflowController.getSiteCollectionDetails
    );

    this.router.get(`${this.path}`, this.WebflowConnectionController.index);
  }
}

export default AirtableConnectionsRoutes;
