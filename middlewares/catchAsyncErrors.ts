import { Request, Response, NextFunction } from "express";

export function catchAsyncErrors(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    fn(req, res, next).catch((error: any) => next(error));
  };
}
