import { ConfigData, SimpleTestModel } from './testlib';

import { ValidationError } from 'class-validator';
import { IsString } from 'class-validator';
import {
  generateIFieldValidationDetail,
  EntityCreationError,
  createAndValidate,
  validateModel,
  IEntityCreator,
} from '@proj/entity';

// Test models for error handling scenarios
class ModelThrowingEntityCreationError implements IEntityCreator {
  @IsString()
  name!: string;

  _postCreateProcessing(): void {
    throw EntityCreationError.from(
      'Custom EntityCreationError from _postCreateProcessing',
      'CustomConstraint',
      'name',
      this.name,
    );
  }
}

class ModelThrowingValidationError implements IEntityCreator {
  @IsString()
  name!: string;

  _postCreateProcessing(): void {
    const validationError = new ValidationError();
    validationError.property = 'name';
    validationError.value = this.name;
    validationError.constraints = { customError: 'ValidationError thrown' };
    throw validationError;
  }
}

class ModelThrowingGenericError implements IEntityCreator {
  @IsString()
  name!: string;

  _postCreateProcessing(): void {
    throw new Error('Generic error from _postCreateProcessing');
  }
}

class ModelThrowingNonError implements IEntityCreator {
  @IsString()
  name!: string;

  _postCreateProcessing(): void {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw 'String error thrown';
  }
}

describe('models.createAndValidate', () => {
  describe('generateIFieldValidationDetail', () => {
    it('should yield correct field and details when parentFields is provided', () => {
      const errors: ValidationError[] = [
        {
          property: 'testProperty',
          value: 'testValue',
          constraints: { constraint1: 'constraint1Value' },
        },
      ];
      const generator = generateIFieldValidationDetail(errors, 'parentField');

      const result = generator.next();
      expect(result.value).toEqual([
        'parentField.testProperty',
        {
          value: 'testValue',
          constraints: { constraint1: 'constraint1Value' },
        },
      ]);
      expect(result.done).toBe(false);
    });

    it('should yield correct field and details when parentFields is not provided', () => {
      const errors: ValidationError[] = [
        {
          property: 'testProperty',
          value: 'testValue',
          constraints: { constraint1: 'constraint1Value' },
        },
      ];
      const generator = generateIFieldValidationDetail(errors);

      const result = generator.next();
      expect(result.value).toEqual([
        'testProperty',
        {
          value: 'testValue',
          constraints: { constraint1: 'constraint1Value' },
        },
      ]);
      expect(result.done).toBe(false);
    });

    it('should yield correct field and details when error.children is empty', () => {
      const errors: ValidationError[] = [
        {
          property: 'testProperty',
          value: 'testValue',
          constraints: { constraint1: 'constraint1Value' },
          children: [],
        },
      ];
      const generator = generateIFieldValidationDetail(errors);

      const result = generator.next();
      expect(result.value).toEqual([
        'testProperty',
        {
          value: 'testValue',
          constraints: { constraint1: 'constraint1Value' },
        },
      ]);
      expect(result.done).toBe(false);
    });

    it('should yield correct field and details when error.children is not empty', () => {
      const errors: ValidationError[] = [
        {
          property: 'testProperty',
          value: 'testValue',
          constraints: { constraint1: 'constraint1Value' },
          children: [
            {
              property: 'childProperty',
              value: 'childValue',
              constraints: { childConstraint1: 'childConstraint1Value' },
            },
          ],
        },
      ];
      const generator = generateIFieldValidationDetail(errors);

      // Note that only testProperty.childProperty is yielded and not testProperty itself
      const result = generator.next();
      expect(result.value).toEqual([
        'testProperty.childProperty',
        {
          value: 'childValue',
          constraints: { childConstraint1: 'childConstraint1Value' },
        },
      ]);
      expect(result.done).toBe(false);

      const result2 = generator.next();
      expect(result2.value).toBeUndefined();
      expect(result2.done).toBe(true);
    });

    it('EntityCreationError from ValidationError', () => {
      const validationError = new ValidationError();
      validationError.property = 's5iUkXkzTd_property';
      validationError.value = 'a1SSmDVS4o_value';
      validationError.constraints = { IsArray: 'error-CySY0i07Op' };

      const err = EntityCreationError.fromValidationError(
        'cdC6gloPQW Error',
        validationError,
      );

      expect(err.message).toBe('cdC6gloPQW Error');
      expect(err.fields).toEqual({
        s5iUkXkzTd_property: {
          value: 'a1SSmDVS4o_value',
          constraints: {
            IsArray: 'error-CySY0i07Op',
          },
        },
      });
    });

    it('EntityCreationError manual', () => {
      const err = EntityCreationError.from(
        'Error kIhQGkApXB not a string',
        'IsString',
        'name',
        123,
      );
      expect(err.message).toBe('Error kIhQGkApXB not a string');
      expect(err.fields).toEqual({
        name: {
          value: 123,
          constraints: {
            IsString: 'Error kIhQGkApXB not a string',
          },
        },
      });
    });
  });

  describe('createAndValidate with createOptions', () => {
    it('createAndValidate should succeed add extraUnknownField to ConfigData instance by default', () => {
      const data = {
        name: 'Test Config Name 1bYQiazARy',
        db: {
          username: 'user123',
          password: 'pass123',
        },
        extraUnknownField: 'extra-1bYQiazARy',
      };

      const result = createAndValidate(ConfigData, data);

      expect(result).toBeInstanceOf(ConfigData);
      expect(result.name).toEqual('Test Config Name 1bYQiazARy');
      expect((result as any).extraUnknownField).toEqual('extra-1bYQiazARy');
    });
    it('createAndValidate should not set excludeExtraneousValues flag if excludeExtraneousValues is true', () => {
      const data = {
        name: 'Test Config Name sTYLBxW2hK',
        db: {
          username: 'user123',
          password: 'pass123',
        },
        extraUnknownField: 'extra-sTYLBxW2hK',
      };
      const options = {
        createOptions: {
          excludeExtraneousValues: true,
        },
        validateModelOptions: {
          disable: true,
        },
      };

      /**
       * Import to note that, in order for excludeExtraneousValues to work,
       * the class properties must be decorated with @Expose from class-transformer.
       * This is already done in ConfigData model used in this test.
       */
      const result = createAndValidate(ConfigData, data, options);

      expect(result).toBeInstanceOf(ConfigData);
      expect(result.name).toEqual('Test Config Name sTYLBxW2hK');
      expect((result as any).extraUnknownField).toBeUndefined();
    });
  });

  // Primary tests for disabling validation using EntityCreatorOptions.disableValidation
  describe('createAndValidate disableValidation', () => {
    it('skips validation when disableValidation is true', () => {
      const badData = { name: 'ab' }; // too short (<3)

      // Without disabling validation, should throw
      expect(() => createAndValidate(SimpleTestModel, badData)).toThrow(
        EntityCreationError,
      );

      // With disableValidation, should NOT throw and should return instance
      const result = createAndValidate(SimpleTestModel, badData, {
        disableValidation: true,
      });
      expect(result).toBeInstanceOf(SimpleTestModel);
      expect(result.name).toEqual('ab');
    });

    it('still validates when disableValidation is false', () => {
      const badData = { name: 'ab' };
      expect(() =>
        createAndValidate(SimpleTestModel, badData, {
          disableValidation: false,
        }),
      ).toThrow(EntityCreationError);
    });
  });

  // Dedicated tests for deprecated ValidateModelOptions.disable
  describe('createAndValidate deprecated ValidateModelOptions.disable', () => {
    it('skips validation when validateModelOptions.disable is true', () => {
      const badData = { name: 'ab' };

      // Should NOT throw when deprecated disable flag is used
      const result = createAndValidate(SimpleTestModel, badData, {
        validateModelOptions: { disable: true },
      });
      expect(result).toBeInstanceOf(SimpleTestModel);
      expect(result.name).toEqual('ab');
    });

    it('validates when deprecated disable is false', () => {
      const badData = { name: 'ab' };
      expect(() =>
        createAndValidate(SimpleTestModel, badData, {
          validateModelOptions: { disable: false },
        }),
      ).toThrow(EntityCreationError);
    });
  });

  describe('createAndValidate externalValidationFunction', () => {
    it('calls externalValidationFunction when provided', () => {
      const goodData = { name: 'ValidName' };
      const mockValidationFn = jest.fn();

      const result = createAndValidate(SimpleTestModel, goodData, {
        externalValidationFunction: mockValidationFn,
      });

      expect(result).toBeInstanceOf(SimpleTestModel);
      expect(result.name).toEqual('ValidName');
      expect(mockValidationFn).toHaveBeenCalledTimes(1);
      expect(mockValidationFn).toHaveBeenCalledWith(result);
    });

    it('externalValidationFunction can throw errors', () => {
      const goodData = { name: 'ValidName' };
      const mockValidationFn = jest.fn(() => {
        throw new Error('Custom validation error');
      });

      expect(() =>
        createAndValidate(SimpleTestModel, goodData, {
          externalValidationFunction: mockValidationFn,
        }),
      ).toThrow('Custom validation error');
      expect(mockValidationFn).toHaveBeenCalledTimes(1);
    });

    it('externalValidationFunction ignores validateModelOptions', () => {
      // Data that would fail standard validation (name too short)
      const badData = { name: 'ab' };
      const mockValidationFn = jest.fn(); // Does not throw

      // Should NOT throw because externalValidationFunction is lenient
      const result = createAndValidate(SimpleTestModel, badData, {
        externalValidationFunction: mockValidationFn,
        validateModelOptions: {
          // These options should be completely ignored
          forbidUnknownValues: true,
          whitelist: true,
        },
      });

      expect(result).toBeInstanceOf(SimpleTestModel);
      expect(result.name).toEqual('ab');
      expect(mockValidationFn).toHaveBeenCalledTimes(1);
      expect(mockValidationFn).toHaveBeenCalledWith(result);
    });

    it('respects disableValidation: true and does not call externalValidationFunction', () => {
      const goodData = { name: 'ValidName' };
      const mockValidationFn = jest.fn();

      const result = createAndValidate(SimpleTestModel, goodData, {
        externalValidationFunction: mockValidationFn,
        disableValidation: true,
      });

      expect(result).toBeInstanceOf(SimpleTestModel);
      expect(result.name).toEqual('ValidName');
      // External validation function should NOT be called
      expect(mockValidationFn).not.toHaveBeenCalled();
    });

    it('respects disableValidation: false and calls externalValidationFunction', () => {
      const goodData = { name: 'ValidName' };
      const mockValidationFn = jest.fn();

      const result = createAndValidate(SimpleTestModel, goodData, {
        externalValidationFunction: mockValidationFn,
        disableValidation: false,
      });

      expect(result).toBeInstanceOf(SimpleTestModel);
      expect(result.name).toEqual('ValidName');
      // External validation function SHOULD be called
      expect(mockValidationFn).toHaveBeenCalledTimes(1);
    });

    it('externalValidationFunction is preferred over standard validation', () => {
      const goodData = { name: 'ValidName' };
      const mockValidationFn = jest.fn();

      const result = createAndValidate(SimpleTestModel, goodData, {
        externalValidationFunction: mockValidationFn,
        // Even with strict validateModelOptions, external function is used
        validateModelOptions: {
          forbidUnknownValues: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        },
      });

      expect(result).toBeInstanceOf(SimpleTestModel);
      expect(mockValidationFn).toHaveBeenCalledTimes(1);
    });

    it('works with nested objects', () => {
      const data = {
        name: 'TestConfig',
        db: {
          username: 'user123',
          password: 'pass123',
        },
      };
      const mockValidationFn = jest.fn();

      const result = createAndValidate(ConfigData, data, {
        externalValidationFunction: mockValidationFn,
      });

      expect(result).toBeInstanceOf(ConfigData);
      expect(result.name).toEqual('TestConfig');
      expect(mockValidationFn).toHaveBeenCalledTimes(1);
      expect(mockValidationFn).toHaveBeenCalledWith(result);
    });
  });

  describe('createAndValidate error handling in catch block', () => {
    it('re-throws EntityCreationError when caught', () => {
      const data = { name: 'test' };

      expect(() =>
        createAndValidate(ModelThrowingEntityCreationError, data, {
          disableValidation: true,
        }),
      ).toThrow(EntityCreationError);

      try {
        createAndValidate(ModelThrowingEntityCreationError, data, {
          disableValidation: true,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(EntityCreationError);
        expect((error as EntityCreationError).message).toBe(
          'Custom EntityCreationError from _postCreateProcessing',
        );
        expect((error as EntityCreationError).fields).toEqual({
          name: {
            value: 'test',
            constraints: {
              CustomConstraint:
                'Custom EntityCreationError from _postCreateProcessing',
            },
          },
        });
      }
    });

    it('wraps ValidationError in EntityCreationError', () => {
      const data = { name: 'test' };

      expect(() =>
        createAndValidate(ModelThrowingValidationError, data, {
          disableValidation: true,
        }),
      ).toThrow(EntityCreationError);

      try {
        createAndValidate(ModelThrowingValidationError, data, {
          disableValidation: true,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(EntityCreationError);
        expect((error as EntityCreationError).message).toContain(
          'ValidationError when creating an instance of ModelThrowingValidationError',
        );
        expect((error as EntityCreationError).fields).toEqual({
          name: {
            value: 'test',
            constraints: {
              customError: 'ValidationError thrown',
            },
          },
        });
      }
    });

    it('wraps generic Error in EntityCreationError', () => {
      const data = { name: 'test' };

      expect(() =>
        createAndValidate(ModelThrowingGenericError, data, {
          disableValidation: true,
        }),
      ).toThrow(EntityCreationError);

      try {
        createAndValidate(ModelThrowingGenericError, data, {
          disableValidation: true,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(EntityCreationError);
        expect((error as EntityCreationError).message).toBe(
          'Failed to create instance of ModelThrowingGenericError: Generic error from _postCreateProcessing',
        );
        expect((error as EntityCreationError).fields).toEqual({});
      }
    });

    it('re-throws non-Error values as-is', () => {
      const data = { name: 'test' };

      expect(() =>
        createAndValidate(ModelThrowingNonError, data, {
          disableValidation: true,
        }),
      ).toThrow('String error thrown');

      try {
        createAndValidate(ModelThrowingNonError, data, {
          disableValidation: true,
        });
      } catch (error) {
        expect(error).toBe('String error thrown');
        expect(error).not.toBeInstanceOf(Error);
      }
    });
  });
});
