import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issue = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        next(ApiError.badRequest('Validation failed', issue));
      } else {
        next(error);
      }
    }
  };
};
