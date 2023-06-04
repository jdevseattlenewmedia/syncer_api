// import { hash } from "bcrypt";
import jwt from "jsonwebtoken";

import db from "../models";
const { Service, User, ConnectedService } = db;
import { HttpException } from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { UserAttributes } from "../interfaces/users.interface";

// const {
//   JwtPayload,
// } = jwt

interface User {
  firstName: string;
  id: string | number;
  userName: string;
}

interface getDummyTokenParams {
  id: string | number;
  // userName: string;
}
interface JwtPayload {
  sub: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  "cognito:username": string;
}
class AuthService {
  public users = db.User;

  public static generateSecretKey = async (
    text = "secretKey"
  ): Promise<any> => {
    // const saltRounds = 10;
    // const secretKey = await hash(text, saltRounds);
    // console.log(secretKey);
    return text;
  };
  public static async findUserByCognitoUserName(
    userName: any
  ): Promise<UserAttributes> {
    if (isEmpty(userName)) throw new HttpException(400, "userName is empty");

    const findUser: UserAttributes = await db.User.findOne({
      where: {
        cognitoUserName: userName,
      },
      raw: true,
    });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }
  public async findUserById(userId: any): Promise<UserAttributes> {
    if (isEmpty(userId)) throw new HttpException(400, "UserId is empty");

    const findUser: UserAttributes = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async getDummyToken({ id }: getDummyTokenParams) {
    const user = await this.findUserById(id);
    console.log({ user });
    const secretKey = await AuthService.generateSecretKey();
    console.log({ secretKey });
    const token = jwt.sign(
      {
        id: user.id,
        sub: user.id,
        iss: "cognito-user-pool-id",
        aud: "client-id",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
        "cognito:username": user?.firstName || "", // custom claim for username
      },
      secretKey
    );
    console.log({ token });
    return token;
  }

  public isTokenExpired = (token: string): boolean => {
    const decodedToken = jwt.decode(token) as JwtPayload;
    if (!decodedToken?.exp) {
      // If the token does not have an expiration time, consider it expired
      return true;
    }
    const currentTime = Date.now() / 1000;
    return decodedToken?.exp < currentTime;
  };

  public async verifyToken(token: string) {
    try {
      const secretKey = await AuthService.generateSecretKey();
      const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
      const user: any = {
        id: decodedToken.sub as any,
        firstName: decodedToken["cognito:username"] as string,
      };
      return user;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async refreshAccessToken(refreshToken: string): Promise<string> {
    const secretKey = await AuthService.generateSecretKey();
    try {
      const decoded = await jwt.verify(refreshToken, secretKey);
      const userId = (decoded as any).userId;
      // Check if the refresh token is valid and not expired, and that the user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      // Generate a new access token and return it
      const accessToken = await this.getDummyToken(user);
      return accessToken;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  // // get data from token
  // public async getUserFromToken(token: string) {
  //   const secretKey = await this.generateSecretKey();
  //   const user = jwt.verify(token, secretKey);
  //   return user;
  // }
}

export default AuthService;
