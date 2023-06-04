import { Request } from "express";
import { UserInterface, JwtPayload } from "./users.interface";

export interface DataStoredInToken extends UserInterface {
  id: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: UserInterface;
}

export interface RequestWithAuthenticatedUser extends Request {
  authenticatedUser: any;
}
