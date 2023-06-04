import { NextFunction, Request, Response } from "express";

import BaseServices from "../services/bases.service";

import { successResponse, errorResponse } from "../config/responses";

import { syncAirtableAndWebflow } from "../helpers/baseSync.helper";

function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
class BasesController {
  public BaseServices = new BaseServices();

  public listAll = async (
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
    const baseList =
      (await this.BaseServices.findAllBasesWithConnection({
        userId,
      })) || {};
    return successResponse(
      {
        statusCode: 200,
        data: baseList,
        message: "User base list",
      },
      res
    );
  };

  public createNewAirtableWebflowSync = async (
    req: Request & {
      authenticatedUser?: any;
    },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { authenticatedUser, body } = req;
      const { id: userId } = authenticatedUser;
      const { baseName = null, connectedServices } = body;

      const baseCustomName =
        baseName || `Airtable -> Webflow sync - ${generateRandomString()}`;

      // save to base table
      const newBase = await this.BaseServices.createNewBase({
        userId,
        baseName: baseCustomName,
      });

      if (newBase?.id) {
        // save to base details
        for (const item of connectedServices) {
          try {
            const formattedItem = {
              baseId: newBase.id,
              connectedServiceId: item?.connectedServiceId,
              connectedServiceWebflowId: item?.connectedServiceWebflowId,
              toSyncData: {
                airtableBaseId: item?.airtableBaseId,
                airtableTableId: item?.airtableTableId,
                airtableView: item?.airtableView,
                webflowCollectionId: item?.webflowCollectionId,
              },
              selectedFieldMap: item?.selectedFieldMap,
            };
            const result = await this.BaseServices.createNewConnectedBase(
              formattedItem
            );
            return successResponse(
              {
                statusCode: 200,
                data: { ...result },
                message: "Base created successfully",
              },
              res
            );
          } catch (error) {
            if (newBase?.id) {
              await this.BaseServices.deleteBaseData(newBase?.id);
            }
            return errorResponse(
              {
                statusCode: 400,
                data: { error },
                message: "An error occurred",
              },
              res
            );
          }
        }
      }
    } catch (err) {
      return errorResponse(
        {
          statusCode: 400,
          data: { err },
          message: "An error occurred",
        },
        res
      );
    }
  };

  public updateEnableAutoSync = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { body, authenticatedUser } = req;
    const { enableAutoSync, baseId } = body;
    const { id: userId } = authenticatedUser;
    try {
      const data = await this.BaseServices.setEnableAutoSync(
        baseId,
        enableAutoSync,
        userId
      );
      return successResponse(
        {
          statusCode: 200,
          data: { baseId, enableAutoSync },
          message: "Sync status Updated successfully",
        },
        res
      );
    } catch (error) {
      return errorResponse(
        {
          statusCode: 400,
          data: { error },
          message: "An error occurred",
        },
        res
      );
    }
  };

  public manualSync = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { body, authenticatedUser } = req;
    const { baseId } = body;
    const { id: userId } = authenticatedUser;

    //start sync
    await await this.BaseServices.updateBaseData(baseId, {
      isSyncing: true,
    });
    // Your manual sync logic here
    // For example, you can call external APIs (Airtable, Webflow) to fetch and sync data
    try {
      const baseData = await this.BaseServices.getBaseDataById(baseId);
      // Perform the sync operation and return any relevant data
      const syncData = {}; // Replace with your actual sync data
      for (const connectedBase of baseData?.ConnectedBases) {
        const {
          selectedFieldMap,
          toSyncData,
          id: connectedBaseId,
          id,
          baseId,
          connectedServiceId,
          connectedServiceWebflowId,
          connectedService,
          connectedServiceWebflow,
        } = connectedBase;

        const {
          accessToken: airtableApiToken,
          // refreshToken
        } = connectedService;
        const {
          accessToken: webflowApiToken,
          // refreshToken
        } = connectedServiceWebflow;

        const {
          airtableBaseId,
          airtableTableId,
          airtableView,
          webflowCollectionId,
        } = toSyncData;

        // Separate Airtable and Webflow fields
        // const airtableFields = selectedFieldMap.map(
        //   (fieldMap: any) => fieldMap.name
        // );
        // const webflowFields = selectedFieldMap.map(
        //   (fieldMap: any) => fieldMap.connectedCorrespondingField
        // );
        const combinedFields = selectedFieldMap.map((fieldMap: any) => {
          return {
            airtableFieldName: fieldMap.name,
            airtableFieldId: fieldMap.id,
            webflowFieldId: fieldMap?.connectedCorrespondingField?.id,
            webflowField: fieldMap.connectedCorrespondingField,
            webflowFieldSlug: fieldMap?.connectedCorrespondingField?.slug,
          };
        });
        try {
          await syncAirtableAndWebflow({
            baseId,
            connectedBaseId,
            airtableApiKey: airtableApiToken,
            airtableBaseId,
            airtableTableId,
            airtableView,
            webflowApiKey: webflowApiToken,
            webflowCollectionId,
            combinedFields,
          });
        } catch (e) {
          console.log({ e });
          // @ts-ignore
          // throw new Error({ e });
        }
      }

      //start sync stop
      await await this.BaseServices.updateBaseData(baseId, {
        isSyncing: false,
      });
      return successResponse(
        {
          statusCode: 200,
          data: baseData,
          message: "Manual sync completed successfully",
        },
        res
      );
    } catch (error) {
      console.log({ error });
      //start sync stop
      await await this.BaseServices.updateBaseData(baseId, {
        isSyncing: false,
      });
      return errorResponse(
        {
          statusCode: 400,
          data: { error },
          message: "An error occurred during manual sync",
        },
        res
      );
    }
  };
}

export default BasesController;
