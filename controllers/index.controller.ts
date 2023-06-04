import { NextFunction, Request, Response } from "express";
import { successResponse } from "../config/responses";
import ConnectedServices from "../services/connectedServices.service";
import DefaultServices from "../services/defaultServices.service";
import { refreshAirtableToken } from "../helpers/airtable.helper";
class IndexController {
  public connectedServices = new ConnectedServices();
  public defaultServices = new DefaultServices();
  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      const responseBody = {
        detailedResponse:
          "Now landed on main api, please search your documentation for more details",
      };
      return successResponse(
        {
          statusCode: 200,
          data: responseBody,
          message: "API is up and running...",
        },
        res
      );
      // res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  public refreshAirTablesGlobalTokenAndUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const defaultService = await this.connectedServices.findByName("airtable");

    const { clientId, clientSecret, id } = defaultService;

    const serviceData =
      await this.connectedServices.findAllConnectedServiceByServiceId({
        serviceId: id,
        currentStatus: null,
      });
    // currentStatus: "CONNECTED",

    if (serviceData && serviceData.length > 0) {
      for (const service of serviceData) {
        try {
          // @ts-ignore
          const { refreshToken = "", id: connectedServiceId } = service || {};
          // // @ts-ignore
          // service: service?.Service,
          const refreshedTokenData = await refreshAirtableToken(
            clientId,
            clientSecret,
            refreshToken
          );

          const newAccessToken = refreshedTokenData.accessToken;
          const newRefreshToken = refreshedTokenData.refreshToken;
          const expiresIn = refreshedTokenData.expiresIn;
          // const rereshExpiresIn = refreshedTokenData.rereshExpiresIn;
          await this.connectedServices.updateAccessToken(
            Number(connectedServiceId),
            newAccessToken,
            expiresIn,
            newRefreshToken,
            "CONNECTED"
            // rereshExpiresIn
          );
        } catch (error) {
          console.log({ error });
        }
      }

      return successResponse(
        {
          statusCode: 200,
          data: {
            message: "Token refreshed successfully",
          },
        },
        res
      );
    }
    return successResponse(
      {
        statusCode: 200,
        data: {
          message: "Zero Token refreshed successfully",
        },
      },
      res
    );
  };
}

export default IndexController;
