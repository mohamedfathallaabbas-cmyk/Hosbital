import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * Creates an Express middleware for validating requests using Zod.
 * @param {z.ZodSchema} schema - The Zod schema to validate against (usually validates body, query, and params)
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update request with validated data (strip unknown fields)
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ValidationError(`Validation Error: ${messages}`));
      }
      next(error);
    }
  };
}
