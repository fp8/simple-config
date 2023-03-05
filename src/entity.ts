
import { validateSync, ValidatorOptions, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { IJson, localDebug, isEmpty } from 'jlog-facade';

/**
 * Default validation options that does not allow for extra entities not
 * defined in the model.  Default settings:
 *
 * - forbidUnknownValues: prevent unknown objects to pass validation
 *
 * Note: for some odd reason, in order for `forbidNonWhitelisted` to work, `whitelist` must
 * also be enabled.
 */
const DEFAULT_VALIDATION_OPTIONS: ValidatorOptions = {
    forbidUnknownValues: true,
};

/**
 * Error thrown by the createAndValidate method and includes ValidationErrro
 */
export class EntityCreationError extends Error {
    public readonly _details: ValidationError[];
  
    constructor(message: string, validationError: ValidationError[]) {
      super(message);
      this._details = validationError;
  
      Object.setPrototypeOf(this, EntityCreationError.prototype);
    }
  
    public get details(): IJson {
      return JSON.parse(JSON.stringify(this._details));
    }
  }
  

/**
 * Create and validate 
 * 
 * @param type 
 * @param data 
 * @param options 
 * @returns 
 */
export function createEntityAndValidate<T extends object>(type: { new(): T; }, data: unknown, options?: ValidatorOptions): T {
    const typeName = type.name;
    let result: T;
    try {
        result = plainToClass(type, data);
    } catch (e) {
        if (e instanceof Error) {
            localDebug(() => `createAndValidate create failed with data: ${data}`);
            throw new EntityCreationError(`Failed to create instance of ${typeName}: ${e.message}`, []);
        } else {
            // If not error, not sure what this is.
            throw e;
        }
    }

    // Validate ConfigData
    const validationResult = validateSync(result, options ?? DEFAULT_VALIDATION_OPTIONS);
    if (!isEmpty(validationResult)) {
        localDebug(() => `createAndValidate validate failed with data: ${data}`);
        throw new EntityCreationError(
            `Validation of ${typeName} failed`,
            validationResult
        );
    }

    return result;
}
