import { NextFunction, Request, Response } from "express";
import { successResponse } from "../config/responses";
import UserService from "../services/user.service";

class DashboardController {
  public userService = new UserService();

  public index = async (
    req: Request & { authenticatedUser?: any },
    res: Response,
    next: NextFunction
  ) => {
    const { authenticatedUser } = req;
    console.log({ authenticatedUser });
    try {
      const connectServices =
        (await this.userService.getAllConnectedServicesByUserId(
          authenticatedUser.id
        )) || [];
      const responseBody = {
        message: "Dashboard api",
        connectServices,
      };
      return successResponse(
        {
          statusCode: 200,
          data: responseBody,
          message: "API is up and running",
        },
        res
      );
      // res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };
}

export default DashboardController;
