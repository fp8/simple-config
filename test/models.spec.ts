import { DatabaseConfig, ConfigDataWithPost } from './testlib';
import { MinLength, IsAlpha, IsDate, ValidationError } from 'class-validator';
import { Transform } from 'class-transformer';

import { createEntityAndValidate, EntityCreationError } from '@fp8proj';

/**
 * Function that raises EntityCreationError when date passed is not valid
 *
 * @param value
 * @param property
 * @returns
 */
function convertToDate(value: unknown, property: string): Date {
  let output: Date | undefined = undefined;
  if (value instanceof Date) {
    output = value;
  } else if (typeof value === 'string') {
    output = new Date(value);
  }

  if (output === undefined || isNaN(output.getDate())) {
    throw EntityCreationError.from(
      `${value} is not a date`,
      'IsDate',
      property,
      value,
    );
  }

  return output;
}

/**
 * Function that raises a ValidationError when specific value is passed.
 *
 * @param value
 * @param property
 * @returns
 */
function checkName(value: unknown, property: string): string {
  if (value === 'raise-QopnsXD2gx') {
    const err = new ValidationError();
    err.property = property;
    err.value = value;
    err.constraints = {
      IsString: 'raise-QopnsXD2gx is not a string',
    };
    throw err;
  }
  return `${value}`;
}

export class ConfigDateError {
  @IsAlpha()
  @MinLength(5)
  @Transform(({ value }) => checkName(value, 'name'))
  name!: string;

  @IsDate()
  @Transform(({ value }) => convertToDate(value, 'createdOn'))
  createdOn!: Date;
}

describe('models.createAndValidate', () => {
  it('simple', () => {
    const data = {
      username: 'user-WC1wpDRnYL',
      password: 'pwd-WC1wpDRnYL',
    };

    const result = createEntityAndValidate(DatabaseConfig, data);
    expect(result.username).toEqual('user-WC1wpDRnYL');
    expect(result.password).toEqual('pwd-WC1wpDRnYL');
  });

  it('extra', () => {
    const data = {
      username: 'user-9FCAWnRuts',
      password: 'pwd-9FCAWnRuts',
      extra: 'extra-9FCAWnRuts',
    };

    const result = createEntityAndValidate(DatabaseConfig, data);
    expect(result.username).toEqual('user-9FCAWnRuts');
    expect(result.password).toEqual('pwd-9FCAWnRuts');

    // intentionally allowing extra
    expect((result as any).extra).toEqual('extra-9FCAWnRuts');
  });

  /**
   * Make sure that ConfigDateError can be created without any error
   */
  it('ConfigDateError OK', () => {
    const data = {
      name: 'namelTjcgaiAkS',
      createdOn: '2020-01-02T03:04:05.678Z',
    };

    const result = createEntityAndValidate(ConfigDateError, data);
    expect(result.name).toEqual('namelTjcgaiAkS');
    expect(result.createdOn).toEqual(new Date('2020-01-02T03:04:05.678Z'));
  });

  /**
   * Make sure that validation error raises EntityCreationError correctly
   */
  it('ConfigDateError raising EntityCreationError', () => {
    const data = {
      name: 'name1n44iOGyZE',
      createdOn: 'Not-a-Date-g2XFDB4eGG',
    };
    let errorRaised = false;

    try {
      createEntityAndValidate(ConfigDateError, data);
    } catch (err) {
      errorRaised = true;
      expect(err).toBeInstanceOf(EntityCreationError);

      // Make sure that EntityCreationError is raised correctly
      const error = err as EntityCreationError;
      expect(error.message).toEqual('Not-a-Date-g2XFDB4eGG is not a date');
      expect(error.fields).toEqual({
        createdOn: {
          value: 'Not-a-Date-g2XFDB4eGG',
          constraints: {
            IsDate: 'Not-a-Date-g2XFDB4eGG is not a date',
          },
        },
      });
    }

    expect(errorRaised).toBe(true);
  });

  /**
   * Make sure that validation error raises ValidationError and it
   * is correctly translated into EntityCreationError
   */
  it('ConfigDateError raising ValidationError', () => {
    const data = {
      name: 'raise-QopnsXD2gx',
      createdOn: '2020-01-02T03:04:05.678Z',
    };
    let errorRaised = false;

    try {
      createEntityAndValidate(ConfigDateError, data);
    } catch (err) {
      errorRaised = true;
      expect(err).toBeInstanceOf(EntityCreationError);

      // Make sure that EntityCreationError is raised correctly
      const error = err as EntityCreationError;
      expect(error.message).toEqual(
        'ValidationError when creating an instance of ConfigDateError',
      );
      expect(error.fields).toEqual({
        name: {
          value: 'raise-QopnsXD2gx',
          constraints: {
            IsString: 'raise-QopnsXD2gx is not a string',
          },
        },
      });
    }

    expect(errorRaised).toBe(true);
  });

  it('ConfigDataWithPost - postCreateProcessing', () => {
    const data = {
      name: 'XltzR1P1T4',
    };

    const result = createEntityAndValidate(ConfigDataWithPost, data);
    expect(result.name).toEqual('XltzR1P1T4');
    expect(result.id).toEqual('id.XltzR1P1T4');
  });
});
