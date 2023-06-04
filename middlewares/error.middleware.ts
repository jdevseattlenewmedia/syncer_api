import { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/HttpException";
import { logger } from "../utils/logger";

const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status: number = error?.status || 500;
    const message: string = error?.message || "Something went wrong";
    console.log({
      status,
      message,
      a: "api error",
    });
    // logger.error(
    //   `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`
    // );
    return res.status(status).json({ message });
  } catch (error) {
    //  const message: string = error.message || "Something went wrong";
    if (error instanceof HttpException) {
      return res.status(error?.status || 505).json({
        statusCode: error?.status || 505,
        message: error?.message || "Something went wrong",
      });
    }
    console.log({
      un_caught_error: {
        error,
        message: "check now",
      },
    });
    next(error);
  }
};

export default errorMiddleware;
