import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err instanceof Error) {
    message = err.message;
  }

  console.error(`[ERROR] ${req.method} ${req.path} (${statusCode}): ${message}`);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(details !== undefined && { details }),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
