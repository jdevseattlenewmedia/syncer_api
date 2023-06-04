import { NextFunction, Request, Response } from "express";
import { errorResponse, successResponse } from "../config/responses";
import request from "request";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import DefaultServices from "../services/defaultServices.service";
import { RequestWithAuthenticatedUser } from "../interfaces/auth.interface";
import { Json } from "sequelize/types/utils";
import ConnectedServices from "../services/connectedServices.service";
import {
  refreshAirtableToken,
  getAirtableBaseList,
} from "../helpers/airtable.helper";
class AirtableConnectionController {
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

  private generateState() {
    // Generate a random state string
    const state = crypto.randomBytes(32).toString("hex");

    // Return the state string
    return state;
  }
  private generateCodeChallenge() {
    // Generate a random string
    const codeVerifier = crypto.randomBytes(32).toString("hex");

    // Hash the random string using the SHA-256 hash function
    const hash = crypto.createHash("sha256");
    hash.update(codeVerifier);
    const codeChallenge = hash
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return {
      codeVerifier: codeVerifier,
      codeChallenge: codeChallenge,
      codeChallengeMethod: "S256",
    };
  }

  public authorize = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { authenticatedUser } = req;
    const { connectedServiceId } = authenticatedUser;
    console.log({ authenticatedUser });
    const state = this.generateState();
    const codeChallengeData = this.generateCodeChallenge();
    const { codeVerifier, codeChallenge, codeChallengeMethod } =
      codeChallengeData;
    const data = await this.defaultServices.findByName("airtable");

    const { clientId, clientSecret, redirectUrl, scope, id: serviceId } = data;

    // console.log({ name, clientId, clientSecret, redirectUrl, scope });

    const url = `https://airtable.com/oauth2/v1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUrl}&state=${state}&code_verifier=${codeVerifier}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}&scope=${scope}`;

    // Save or update connectedService
    let connectedServiceData;
    const dbInsertData = {
      userId: authenticatedUser.id,
      serviceId: serviceId,
      codeVerifier,
    };

    if (connectedServiceId) {
      // Update the existing connected service
      await this.connectedServices.updateConnectedService(
        connectedServiceId,
        dbInsertData
      );
      connectedServiceData =
        await this.connectedServices.getConnectedServiceById(
          connectedServiceId
        );
    } else {
      // Create a new connected service
      connectedServiceData =
        await this.connectedServices.createNewConnectedService(dbInsertData);
    }

    return successResponse(
      {
        statusCode: 200,
        data: {
          authUrl: url,
          connectedServiceId: connectedServiceData.id,
          connectedServiceName: connectedServiceData.name,
          connectedServiceStatus: connectedServiceData.currentStatus,
          connectedServiceisConnected: connectedServiceData.isConnected,
          codeVerifier,
        },
        message: "Authorize airtable",
      },
      res
    );
  };

  public reAuthorize = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { authenticatedUser } = req;
    const { connectedServiceId } = req.body;
    // Fetch the existing connected service data
    const connectedServiceData =
      await this.connectedServices.getConnectedServiceById(connectedServiceId);

    // Check if connectedServiceStatus is "INPROGRESS"
    if (connectedServiceData?.currentStatus !== "CONNECTED") {
      // Update the authenticatedUser object with the connectedServiceId
      req.authenticatedUser = {
        ...authenticatedUser,
        connectedServiceId,
      };

      // Reuse the authorize method to initiate the reauthorization process
      return await this.authorize(req, res, next);
    } else {
      return res.status(400).json({
        statusCode: 400,
        message:
          "Reauthorization can only be performed if the status is not CONNECTED.",
      });
    }
    // return await this.authorize(req, res, next);
  };

  public callback = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { code, state, code_challenge, code_challenge_method } = req.query;
    const query = req.query;
    console.log({ query });
    return successResponse(
      {
        statusCode: 200,
        data: { query },
        message: "Authorize airtable",
      },
      res
    );
  };

  public callbackVerify = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const {
      authenticatedUser: { id: userId },
      body,
    } = req;
    const {
      code,
      state,
      code_challenge,
      code_challenge_method,
      connectedServiceId,
    } = body;

    try {
      const data = await this.defaultServices.findByName("airtable");

      const { clientId, clientSecret, id: serviceId, redirectUrl } = data;

      const conectServiceData =
        await this.connectedServices.getConnectedServiceById(
          connectedServiceId
        );

      const codeVerifier: any = conectServiceData?.codeVerifier; // from db

      // return ;
      const auth = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      )}`;

      const body: any =
        (await new Promise((resolve, reject) => {
          const options = {
            url: "https://airtable.com/oauth2/v1/token",
            headers: {
              Authorization: auth,
            },
            form: {
              grant_type: "authorization_code",
              code,
              state,
              redirect_uri: redirectUrl,
              code_verifier: codeVerifier,
            },
          };
          console.log({ options });
          request.post(options, function (err, resp, body) {
            if (err) {
              reject(err);
            } else {
              resolve(body);
            }
          });
        })) || {};
      const responseBody = body ? JSON.parse(body) : {};

      // Check for the access token in the response
      if (responseBody.access_token) {
        // Update the connected service with new data
        await this.connectedServices.updateConnectedService(
          connectedServiceId,
          {
            accessToken: responseBody.access_token,
            refreshToken: responseBody.refresh_token,
            expiresIn: responseBody.expires_in,
            tokenType: responseBody.token_type,
            isConnected: true,
            currentStatus: "CONNECTED",
          }
        );
      } else {
        // Handle error: Access token not received
        return res.status(400).json({
          message: "Access token not received",
          data: responseBody,
        });
      }

      return successResponse(
        {
          statusCode: 200,
          data: {
            responseBody,
          },
          message: "Airtable authorize completed",
        },
        res
      );

      // console.log({
      //   data: body,
      //   code,
      //   state,
      //   code_challenge,
      //   code_challenge_method,
      //   // codeVerifier,
      //   aaaa: "AAANSSSSWERR",
      // });
    } catch (err) {
      return errorResponse(
        {
          statusCode: 500,
          data: err,
          message: "Error fetching connected Airtable services",
        },
        res
      );
      // console.log({ err });
      // res.status(500).send(err);
    }
  };

  public getConnectedAirtableServices = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { authenticatedUser } = req;
    const { id: userId } = authenticatedUser;

    try {
      const servicesFromDb =
        await this.connectedServices.getConnectedAirtableServices(userId);
      let connectedServices = [];
      // loop async await
      for (let item of servicesFromDb) {
        const { accessToken } = item;
        if (accessToken) {
          try {
            const airtableBaseList = await getAirtableBaseList({ accessToken });
            // connectedServices.push(airtableBaseList);
            const { id, userId, isConnected } = item;
            connectedServices.push({
              airtableBaseList,
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
          message: "Connected Airtable services",
        },
        res
      );
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error fetching connected Airtable services", error });
    }
  };

  public refreshTokenAndUpdate = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { authenticatedUser } = req;
    const { id: userId } = authenticatedUser;
    const { connectedServiceId } = req.body;

    try {
      console.log({ connectedServiceId });
      const connectedServiceData =
        await this.connectedServices.getConnectedServiceById(
          connectedServiceId
        );
      console.log({ connectedServiceData });

      const serviceData = await this.defaultServices.findById(
        connectedServiceData?.serviceId || 0
      );
      const refreshToken = connectedServiceData?.refreshToken || "";

      const clientId = serviceData.clientId;
      const clientSecret = serviceData.clientSecret;

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
        newRefreshToken
        // rereshExpiresIn
      );

      // return successResponse(
      //   {

      //     message: "Access token refreshed and updated in the database",
      //   data: {

      //   },
      // },  res

      // )

      res.status(200).send({
        message: "Access token refreshed and updated in the database",
      });
    } catch (error) {
      console.log({ error });
      res
        .status(500)
        .send({ message: "Error refreshing and updating access token", error });
    }
  };
}

export default AirtableConnectionController;
