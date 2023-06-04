import { Response } from "express";

interface ResponseData {
  statusCode: number;
  data: any;
  message?: string;
}

export const successResponse = (
  { statusCode = 200, data, message }: ResponseData,
  res: Response = {} as Response
) => {
  return res.status(statusCode).json({ message, data });
};

export const errorResponse = (
  { statusCode = 500, data = null, message }: ResponseData,
  res: Response = {} as Response
) => {
  return successResponse({ statusCode, data, message }, res);
};
