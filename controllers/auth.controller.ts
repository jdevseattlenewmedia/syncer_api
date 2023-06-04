import { NextFunction, Request, Response } from "express";
// import { CreateUserDto } from '@dtos/users.dto';
import { UserInterface } from "@interfaces/users.interface";
import { RequestWithUser } from "@interfaces/auth.interface";
import AuthService from "../services/auth.service";
import { successResponse, errorResponse } from "../config/responses";
import { login } from "../config/awsCognitoAdmin";
interface generateDummyInterface {
  userId: number;
}
class AuthController {
  public authService = new AuthService();

  public loginUserWithUserName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { accessToken, idToken, refreshToken } = await login({
        userName: req.body.userName,
        password: req.body.password,
      });
      return successResponse(
        {
          statusCode: 200,
          data: { accessToken, idToken, refreshToken },
          message: "Login successful",
        },
        res
      );
    } catch (err) {
      console.log(`Login failed: ${err}`);
      return errorResponse(
        {
          statusCode: 500,
          data: err,
          message: "Login failed",
        },
        res
      );
    }
  };

  public dummyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData: generateDummyInterface = req.body;

      const dummyToken = await this.authService.getDummyToken({
        id: userData.userId,
        // userName: `${userData.userId}-temp-user`,
      });
      return successResponse(
        {
          statusCode: 200,
          data: dummyToken,
          message: "Dummy token generated",
        },
        res
      );
    } catch (error) {
      return errorResponse(
        {
          statusCode: 500,
          data: error,
          message: "Error generating dummy token",
        },
        res
      );
    }
  };

  // public signUp = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userData: CreateUserDto = req.body;
  //     const signUpUserData: User = await this.authService.signup(userData);

  //     res.status(201).json({ data: signUpUserData, message: 'signup' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // public logIn = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userData: CreateUserDto = req.body;
  //     const { cookie, findUser } = await this.authService.login(userData);

  //     res.setHeader('Set-Cookie', [cookie]);
  //     res.status(200).json({ data: findUser, message: 'login' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     const userData: User = req.user;
  //     const logOutUserData: User = await this.authService.logout(userData);

  //     res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
  //     res.status(200).json({ data: logOutUserData, message: 'logout' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default AuthController;
