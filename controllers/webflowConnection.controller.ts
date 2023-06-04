import { NextFunction, Request, Response } from "express";
import { errorResponse, successResponse } from "../config/responses";
import request from "request";
import DefaultServices from "../services/defaultServices.service";
import ConnectedServices from "../services/connectedServices.service";
import { Json } from "sequelize/types/utils";
import { getSitesFromWebflow } from "../helpers/webflow.helper";
class WebflowConnectionController {
  public defaultServices = new DefaultServices();
  public connectedServices = new ConnectedServices();

  public index = (req: Request, res: Response, next: NextFunction) => {
    const responseBody = {
      message: "Working on it",
    };
    return successResponse(
      {
        statusCode: 200,
        data: responseBody,
        message: "API is up and running",
      },
      res
    );
  };

  public authorize = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { authenticatedUser } = req;
    console.log({ authenticatedUser });
    const data = await this.defaultServices.findByName("webflow");

    const { clientId, redirectUrl, scope, id: serviceId } = data;

    const url = `https://webflow.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUrl}&scope=${scope}`;
    console.log({
      url,
      clientId,
      redirectUrl,
      scope,
    });
    // save to connectedService

    const dbInsertData = {
      userId: authenticatedUser.id,
      serviceId: serviceId,
      codeVerifier: "webflow",
    };
    try {
      const connectedServiceData =
        await this.connectedServices.createNewConnectedService(dbInsertData);
      return successResponse(
        {
          statusCode: 200,
          data: {
            authUrl: url,
            connectedServiceId: connectedServiceData.id,
            connectedServiceName: connectedServiceData.name,
            connectedServiceStatus: connectedServiceData.currentStatus,
            connectedServiceisConnected: connectedServiceData.isConnected,
          },
          message: "Authorize webflow",
        },
        res
      );
    } catch (e) {
      console.log(e);
      return errorResponse({
        statusCode: 500,
        data: { e },
        message: "Internal server error",
      });
    }
  };

  public callback = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { code } = req.query;
    const query = req.query;
    console.log({ query });
    return successResponse(
      {
        statusCode: 200,
        data: { query },
        message: "Authorize webflow",
      },
      res
    );
  };

  private async getAccessTokenHelper(code: string) {
    const data = await this.defaultServices.findByName("webflow");

    const { clientId, redirectUrl, clientSecret } = data;

    const tokenUrl = `https://api.webflow.com/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUrl}`;

    return new Promise((resolve, reject) => {
      request.post(tokenUrl, (error, response, body) => {
        if (error) {
          console.log({ firstError: error });
          reject(error);
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
  }

  public getAccessToken = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { code, connectedServiceId } = req.body;
    const { authenticatedUser } = req;
    const userId = authenticatedUser.id;

    try {
      // Get access token
      const tokenData: any = await this.getAccessTokenHelper(code);
      console.log({ tokenData });
      if (!tokenData?.access_token) {
        return errorResponse(
          {
            statusCode: 500,
            data: { tokenData },
            message: "Error fetching Webflow access token",
          },
          res
        );
      }
      // Store the access token in the connected service
      await this.connectedServices.updateConnectedService(connectedServiceId, {
        accessToken: tokenData.access_token,
        // refreshToken: tokenData.access_token,
        // expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
        isConnected: true,
        currentStatus: "CONNECTED",
      });

      return successResponse(
        {
          statusCode: 200,
          data: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            tokenType: tokenData.token_type,
          },
          message: "Webflow access token saved",
        },
        res
      );
    } catch (error) {
      console.log({ error });
      return errorResponse(
        {
          statusCode: 500,
          data: error,
          message: "Error fetching Webflow access token",
        },
        res
      );
    }
  };

  public getConnectedWebFlowServices = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { authenticatedUser } = req;
    const { id: userId } = authenticatedUser;

    try {
      const servicesFromDb =
        await this.connectedServices.getConnectedWebFlowServices(userId);

      let connectedServices = [];
      // loop async await
      for (let item of servicesFromDb) {
        console.log({ item });
        const { accessToken } = item;
        if (accessToken) {
          try {
            const webFlowSitesList = await getSitesFromWebflow(accessToken);
            const { id, userId, isConnected } = item;
            connectedServices.push({
              webFlowSitesList,
              dbData: {
                id,
                userId,
                isConnected,
              },
            });
          } catch (err) {
            // console.log(err);
          }
        }
      }

      return successResponse(
        {
          statusCode: 200,
          data: { connectedServices },
          message: "Connected Webflow services",
        },
        res
      );
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error fetching connected Webflow services", error });
    }
  };

  public revokeAuthorization = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { authenticatedUser } = req;
    const { connectedServiceId } = req.body;

    try {
      await this.connectedServices.revokeAuthorization(connectedServiceId);
      return successResponse(
        {
          statusCode: 200,
          data: { connectedServiceId },
          message: "Webflow authorization revoked",
        },
        res
      );
    } catch (error) {
      return errorResponse(
        {
          statusCode: 500,
          data: error,
          message: "Error revoking Webflow authorization",
        },
        res
      );
    }
  };
}

export default WebflowConnectionController;
