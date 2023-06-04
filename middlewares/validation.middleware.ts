import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";
import { HttpException } from "../exceptions/HttpException";

const validationMiddleware = (
  type: any,
  value: string | "body" | "query" | "params" = "body",
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true
): RequestHandler => {
  return (
    req: {
      [key: string]: any;
    },
    _res,
    next
  ) => {
    const data: any = req[value] || {};
    validate(plainToClass(type, data), {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted,
    }).then((errors: any) => {
      if (errors.length > 0) {
        const message = "error validation messages: ";
        // errors
        //   .map((error: ValidationError) => Object.values(error?.constraints))
        //   .join(", ");
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;
