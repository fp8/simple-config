
import { validateSync, ValidatorOptions, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { IJson, localDebug, isEmpty, TJsonValue } from 'jlog-facade';

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
    forbidUnknownValues: true
};

/**
 * Detail error of validation error per field
 */
export interface IFieldValidationDetail {
    value: TJsonValue;
    constraints?: Record<string, string>;
}

/**
 * Field validation result
 */
export interface IFieldValidationError {
    [field: string]: IFieldValidationDetail;
}

function* generateIFieldValidationDetail(errors: ValidationError[], parentFields?: string): Generator<[string, IFieldValidationDetail]> {
    for (const error of errors) {
        let field: string;
        if (parentFields) {
            field = `${parentFields}.${error.property}`;
        } else {
            field = error.property;
        }
    
        if (error.children === undefined || isEmpty(error.children)) {
            const details =  {
                value: error.value,
                constraints: error.constraints
            }
            yield [field, details];
        } else {
            for (const entry of generateIFieldValidationDetail(error.children, field)) {
                yield entry;
            }
        }
    }
}

/**
 * Error thrown by the createAndValidate method and include a .fields
 * attribute returning all fields with error
 */
export class EntityCreationError extends Error {
    public readonly _raw: ValidationError[];
    public readonly fields: IFieldValidationError = {};

    constructor(message: string, validationError: ValidationError[]) {
      super(message);

      this._raw = validationError;
      for (const [field, detail] of generateIFieldValidationDetail(validationError)) {
        this.fields[field] = detail;
      }

      Object.setPrototypeOf(this, EntityCreationError.prototype);
    }
  
    /**
     * Return raw ValidationError from class-validator
     */
    public get rawValidationError(): IJson {
      return JSON.parse(JSON.stringify(this._raw));
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
