import { NextFunction, Request, Response } from "express";

import ConnectedServices from "../services/connectedServices.service";
import { successResponse, errorResponse } from "../config/responses";
import {
  getSitesFromWebflow,
  getCollectionsFromWebflow,
  getCollectionDetailsFromWebflow,
} from "../helpers/webflow.helper";

class WebflowController {
  public connectedServices = new ConnectedServices();

  public getSitesByConnectionId = async (
    req: Request & {
      authenticatedUser?: any;
      params: {
        id: number;
      };
    },
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const connectedServiceData: any =
      await this.connectedServices.getConnectedServiceById(id);
    const { accessToken } = connectedServiceData;
    if (accessToken) {
      const webflowSitesList = await getSitesFromWebflow(accessToken);
      return successResponse(
        {
          statusCode: 200,
          data: webflowSitesList || null,
          message: "Webflow sites list",
        },
        res
      );
    } else {
      return errorResponse(
        {
          statusCode: 400,
          data: {},
          message: "Access token not received",
        },
        res
      );
    }
  };
  public getSiteCollections = async (
    req: Request & {
      authenticatedUser?: any;
      params: {
        id: number;
        siteId: string;
      };
    },
    res: Response,
    next: NextFunction
  ) => {
    const { id, siteId } = req.params;
    const connectedServiceData: any =
      await this.connectedServices.getConnectedServiceById(id);
    const { accessToken } = connectedServiceData;
    console.log({ accessToken });
    if (accessToken) {
      const webflowCollectionsList = await getCollectionsFromWebflow(
        siteId,
        accessToken
      );
      return successResponse(
        {
          statusCode: 200,
          data: webflowCollectionsList || null,
          message: "Webflow collection list",
        },
        res
      );
    } else {
      return errorResponse(
        {
          statusCode: 400,
          data: {},
          message: "Access token not received",
        },
        res
      );
    }
  };
  public getSiteCollectionDetails = async (
    req: Request & {
      authenticatedUser?: any;
      params: {
        id: number;
        collectionId: string;
      };
    },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, collectionId } = req.params;
      const connectedServiceData: any =
        await this.connectedServices.getConnectedServiceById(id);
      const { accessToken } = connectedServiceData;
      console.log({ accessToken, collectionId });
      if (accessToken) {
        const webflowCollectionsList = await getCollectionDetailsFromWebflow(
          collectionId,
          accessToken
        );

        return successResponse(
          {
            statusCode: 200,
            data: webflowCollectionsList || null,
            message: "Webflow collection details",
          },
          res
        );
      } else {
        return errorResponse(
          {
            statusCode: 400,
            data: {},
            message: "Access token not received",
          },
          res
        );
      }
    } catch (error) {
      return errorResponse(
        {
          statusCode: 500,
          data: error,
          message: "Error retrieving Webflow collection details",
        },
        res
      );
    }
  };
}

export default WebflowController;
