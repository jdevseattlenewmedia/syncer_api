import { NextFunction, Response, Request } from "express";
import { verify } from "jsonwebtoken";
import { HttpException } from "../exceptions/HttpException";
import {
  DataStoredInToken,
  // RequestWithAuthenticatedUser,
} from "../interfaces/auth.interface";
import AuthService from "../services/auth.service";

import { verifyToken } from "../config/awsCognito";

interface RequestWithAuthenticatedUser extends Request {
  authenticatedUser: any;
}

const authMiddleware = async (
  // req: RequestWithAuthenticatedUser,
  req: Request & { authenticatedUser?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const Authorization = req.header("Authorization")
      ? req?.header("Authorization")?.split("Bearer ")[1]
      : null;
    req.authenticatedUser = null;
    if (Authorization) {
      const isValid: any = (await verifyToken(Authorization)) || {};
      if (!isValid["cognito:username"]) {
        next(new HttpException(401, "Wrong token"));
      }
      // // REMOVE
      const userName = isValid ? isValid["cognito:username"] : "";
      const dbUserdata = await AuthService?.findUserByCognitoUserName(userName);

      if (dbUserdata) {
        req.authenticatedUser = { ...dbUserdata };
        next();
      } else {
        next(new HttpException(401, "Wrong authentication token"));
      }
    } else {
      next(new HttpException(404, "Authentication token missing"));
    }
  } catch (error) {
    console.log({ error });
    next(new HttpException(401, "Wrong authentication token"));
  }
};

export default authMiddleware;
