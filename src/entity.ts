
import { validateSync, ValidatorOptions, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { IJson, localDebug, isEmpty, TJsonValue, Loggable } from 'jlog-facade';

import { logger } from './core';

/**
 * Options to be passed to `.validateModel` method.  Extends `ValidatorOptions` from class-validator
 * with additional `disable` option to skip validation.
 */
export interface ValidateModelOptions extends ValidatorOptions {
    // Disable validation
    disable?: boolean;
}

/**
 * Default validation options that does not allow for extra entities not
 * defined in the model.  Default settings:
 *
 * - forbidUnknownValues: prevent unknown objects to pass validation
 *
 * Note: for some odd reason, in order for `forbidNonWhitelisted` to work, `whitelist` must
 * also be enabled.
 */
const DEFAULT_VALIDATION_OPTIONS: ValidateModelOptions = {
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

/**
 * Create a simplified version of the validation error with field name and constraints violated
 * 
 * @param errors 
 * @param parentFields 
 */
export function* generateIFieldValidationDetail(errors: ValidationError[], parentFields?: string): Generator<[string, IFieldValidationDetail]> {
    for (const error of errors) {
        let field: string;
        if (parentFields) {
            field = `${parentFields}.${error.property}`;
        } else {
            field = error.property;
        }

        /*
        Intentially skipping the error details when error contains children.  For example, if the we have a structure such as:

        {
            "name": "John",
            "address": {
                "street": "123 Main St",
                "city": "San Francisco"
            }
        }

        If address.city has an error, we just want to report error for address.city and not address.
        */
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

    /**
     * Create an EntityCreationError manually from message and property
     * 
     * @param message Error message that serve as error message as well as error for the constraint
     * @param constraint constraint from class-transformer.  E.g.: IsString, IsDate, etc
     * @param property The property name that is being validated
     * @param value Value passed to the property
     * @returns 
     */
    static from(message: string, constraint: string, property: string, value: unknown): EntityCreationError {
        const validationError = new ValidationError();
        validationError.property = property;
        validationError.value = value;
        validationError.constraints = {
            [constraint]: message
        };
        return EntityCreationError.fromValidationError(message, validationError);
    }

    /**
     * Create an instance of EntityCreationError by specifying a message and passing a ValidationError
     *
     * @param message 
     * @param validationError 
     * @returns 
     */
    static fromValidationError(message: string, validationError: ValidationError): EntityCreationError {
        return new EntityCreationError(message, [validationError]);
    }

    constructor(message: string, validationError: ValidationError[], options?: ErrorOptions) {
        super(message, options);

        this._raw = validationError;
        for (const [field, detail] of generateIFieldValidationDetail(validationError)) {
            this.fields[field] = detail;
        }

        this.name = EntityCreationError.name;
    }

    /**
     * Return raw ValidationError from class-validator
     */
    public get rawValidationError(): IJson {
        return JSON.parse(JSON.stringify(this._raw));
    }
}


/**
 * Validate input model
 *
 * @param cls
 * @param options
 */
export function validateModel(
    cls: object,
    options: ValidateModelOptions = DEFAULT_VALIDATION_OPTIONS,
): void {
    // Skip validation if disabled
    if (options.disable) {
        return;
    }

    // Start validation
    const validationResult = validateSync(cls, options);

    if (!isEmpty(validationResult)) {
        const message = `Validation failed for ${cls.constructor.name}`;
        logger.debug(message, Loggable.of('validationResult', validationResult));
        throw new EntityCreationError(message, validationResult);
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
export function createEntityAndValidate<T extends object>(type: { new(): T; }, data: unknown, options?: ValidateModelOptions): T {
    const typeName = type.name;
    let result: T;
    try {
        result = plainToClass(type, data);
    } catch (e) {
        localDebug(() => `createAndValidate create failed with data: ${data}`);
        if (e instanceof EntityCreationError) {
            throw e;
        } else if (e instanceof ValidationError) {
            throw EntityCreationError.fromValidationError(`ValidationError when creating an instance of ${typeName}`, e);
        } else if (e instanceof Error) {
            throw new EntityCreationError(`Failed to create instance of ${typeName}: ${e.message}`, []);
        } else {
            // If not error, not sure what this is.
            throw e;
        }
    }

    // Validate ConfigData
    validateModel(result, options ?? DEFAULT_VALIDATION_OPTIONS);

    return result;
}
