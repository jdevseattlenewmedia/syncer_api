import { NextFunction, Request, Response } from "express";

import ConnectedServices from "../services/connectedServices.service";
import { successResponse, errorResponse } from "../config/responses";
import {
  getAirtableBaseList,
  getAirtableTables,
  getAirtableTableDetails,
  getMeDataService,
} from "../helpers/airtable.helper";

class AirtableController {
  public connectedServices = new ConnectedServices();

  public getMeData = async (
    req: Request & {
      authenticatedUser?: any;
    },
    res: Response,
    next: NextFunction
  ) => {
    const { authenticatedUser } = req;
    const { id: userId } = authenticatedUser;
    const id = 6;
    const connectedServiceData: any =
      await this.connectedServices.getConnectedServiceById(id);
    const { accessToken } = connectedServiceData;
    console.log({ accessToken });
    if (accessToken) {
      try {
        const meData = await getMeDataService({ accessToken });
        return successResponse(
          {
            statusCode: 200,
            data: { meData },
            message: "Airtable me data",
          },
          res
        );
      } catch (error) {
        return errorResponse(
          {
            statusCode: 500,
            data: {},
            // @ts-ignore
            message: error?.message || "No data",
          },
          res
        );
      }
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
  public getBasesByConnectionId = async (
    req: Request & {
      authenticatedUser?: any;
      params: {
        id: number;
      };
    },
    res: Response,
    next: NextFunction
  ) => {
    const { authenticatedUser } = req;
    const { id: userId } = authenticatedUser;
    const { id } = req.params;
    const connectedServiceData: any =
      await this.connectedServices.getConnectedServiceById(id);
    const { accessToken } = connectedServiceData;
    console.log({ accessToken });
    if (accessToken) {
      const airtableBaseList = await getAirtableBaseList({ accessToken });
      return successResponse(
        {
          statusCode: 200,
          data: { airtableBaseList },
          message: "Airtable base list",
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

  public getTablesByBaseId = async (
    req: Request & {
      authenticatedUser?: any;
      params: {
        baseId: string;
        id: number;
      };
    },
    res: Response,
    next: NextFunction
  ) => {
    const { id, baseId } = req.params;

    const connectedServiceData: any =
      await this.connectedServices.getConnectedServiceById(id);
    const { accessToken } = connectedServiceData;

    if (accessToken) {
      try {
        const airtableTables = await getAirtableTables({ baseId, accessToken });
        return successResponse(
          {
            statusCode: 200,
            data: airtableTables || {},
            message: "Airtable tables list",
          },
          res
        );
      } catch (error) {
        return errorResponse(
          {
            statusCode: 400,
            data: {},
            message: "Error fetching Airtable tables",
          },
          res
        );
      }
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
  public getTablesByBaseIdAndTableId = async (
    req: Request & {
      authenticatedUser?: any;
      params: {
        baseId: string;
        id: number;
        tableId: string;
      };
    },
    res: Response,
    next: NextFunction
  ) => {
    const { id, baseId, tableId } = req.params;

    const connectedServiceData: any =
      await this.connectedServices.getConnectedServiceById(id);
    const { accessToken } = connectedServiceData;

    if (accessToken) {
      try {
        const airtableTables = await getAirtableTableDetails({
          baseId,
          accessToken,
          tableId,
        });
        return successResponse(
          {
            statusCode: 200,
            data: airtableTables || {},
            message: "Airtable table details",
          },
          res
        );
      } catch (error) {
        return errorResponse(
          {
            statusCode: 400,
            data: {},
            message: "Error fetching Airtable table details",
          },
          res
        );
      }
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
}

export default AirtableController;
