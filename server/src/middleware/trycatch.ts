import type { RequestHandler } from "express";

const TryCatch = (handler: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

export default TryCatch;
