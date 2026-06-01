/**
 * ZOD VALIDATION MIDDLEWARE
 * 
 * Validates request body, query, or params against a Zod schema.
 * Throws a formatted ValidationError if validation fails.
 */

import { z } from 'zod';
import { ValidationError } from './errors.js';

/**
 * Creates an Express middleware that validates the request against a Zod schema.
 * @param {z.ZodTypeAny} schema - The Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - The part of the request to validate (default: 'body')
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Format Zod errors into a readable map: { fieldName: 'error message' }
        const fields = {};
        err.errors.forEach((e) => {
          if (e.path.length > 0) {
            fields[e.path.join('.')] = e.message;
          }
        });
        
        // Pass to the global error handler
        return next(new ValidationError('البيانات المدخلة غير صحيحة', fields));
      }
      next(err);
    }
  };
};
