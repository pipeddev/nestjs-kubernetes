import { StructuredValidationSafePipe } from '../../../src/common/pipes/structured-validation.pipe';
import { ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';
import { JSendUtil } from '../../../src/common/utils/jsend.util';
import { validate } from 'class-validator';

jest.mock('class-validator');
jest.mock('class-transformer', () => ({
  plainToClass: jest.fn(
    <T>(cls: new () => T, obj: object): T => Object.assign(new cls() as any, obj as T),
  ),
}));

// Dummy DTO for validation
class TestDto {
  name!: string;
}

describe('StructuredValidationSafePipe', () => {
  let pipe: StructuredValidationSafePipe;

  beforeEach(() => {
    pipe = new StructuredValidationSafePipe();
    jest.clearAllMocks();
  });

  it('should throw if value is null', async () => {
    const metadata: ArgumentMetadata = { metatype: TestDto, type: 'body', data: '' };
    await expect(pipe.transform(null, metadata)).rejects.toThrow(HttpException);
    try {
      await pipe.transform(null, metadata);
    } catch (e: unknown) {
      const err = e as HttpException;
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(err.getResponse()).toEqual(
        JSendUtil.fail({
          message: 'Validation failed',
          errors: [{ value: ['Value should not be null or undefined'] }],
        }),
      );
    }
  });

  it('should throw if value is undefined', async () => {
    const metadata: ArgumentMetadata = { metatype: TestDto, type: 'body', data: '' };
    await expect(pipe.transform(undefined, metadata)).rejects.toThrow(HttpException);
  });

  it('should return value if metatype is not provided', async () => {
    const value = { foo: 'bar' };
    const metadata: ArgumentMetadata = { metatype: undefined, type: 'body', data: '' };
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(value);
  });

  it('should return value if metatype is primitive', async () => {
    const value = 'test';
    const metadata: ArgumentMetadata = { metatype: String, type: 'body', data: '' };
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(value);
  });

  it('should return object if validation passes', async () => {
    (validate as jest.Mock).mockResolvedValue([]);
    const value = { name: 'John' };
    const metadata: ArgumentMetadata = { metatype: TestDto, type: 'body', data: '' };
    const result = await pipe.transform(value, metadata);
    expect(result).toEqual(expect.objectContaining({ name: 'John' }));
  });

  it('should throw HttpException with structured errors if validation fails', async () => {
    (validate as jest.Mock).mockResolvedValue([
      {
        property: 'name',
        constraints: { isNotEmpty: 'name should not be empty' },
        children: [],
      },
    ]);
    const value = { name: '' };
    const metadata: ArgumentMetadata = { metatype: TestDto, type: 'body', data: '' };

    await expect(pipe.transform(value, metadata)).rejects.toThrow(HttpException);
    try {
      await pipe.transform(value, metadata);
    } catch (e: unknown) {
      const err = e as HttpException;
      expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(err.getResponse()).toEqual(
        JSendUtil.fail({
          message: 'Validation failed',
          errors: [{ name: ['name should not be empty'] }],
        }),
      );
    }
  });

  it('should handle nested validation errors', async () => {
    (validate as jest.Mock).mockResolvedValue([
      {
        property: 'profile',
        constraints: undefined,
        children: [
          {
            property: 'email',
            constraints: { isEmail: 'email must be an email' },
            children: [],
          },
          {
            property: 'address',
            constraints: undefined,
            children: [
              {
                property: 'city',
                constraints: { isNotEmpty: 'city should not be empty' },
                children: [],
              },
            ],
          },
        ],
      },
    ]);
    const value = { profile: { email: 'not-an-email', address: { city: '' } } };
    const metadata: ArgumentMetadata = { metatype: TestDto, type: 'body', data: '' };

    await expect(pipe.transform(value, metadata)).rejects.toThrow(HttpException);
    try {
      await pipe.transform(value, metadata);
    } catch (e: unknown) {
      const err = e as HttpException;
      expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(err.getResponse()).toEqual(
        JSendUtil.fail({
          message: 'Validation failed',
          errors: [
            { 'profile.email': ['email must be an email'] },
            { 'profile.address.city': ['city should not be empty'] },
          ],
        }),
      );
    }
  });

  it('should handle multiple errors on the same property', async () => {
    (validate as jest.Mock).mockResolvedValue([
      {
        property: 'name',
        constraints: {
          isNotEmpty: 'name should not be empty',
          isString: 'name must be a string',
        },
        children: [],
      },
    ]);
    const value = { name: 123 };
    const metadata: ArgumentMetadata = { metatype: TestDto, type: 'body', data: '' };

    await expect(pipe.transform(value, metadata)).rejects.toThrow(HttpException);
    try {
      await pipe.transform(value, metadata);
    } catch (e: unknown) {
      const err = e as HttpException;
      expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(err.getResponse()).toEqual(
        JSendUtil.fail({
          message: 'Validation failed',
          errors: [{ name: ['name should not be empty', 'name must be a string'] }],
        }),
      );
    }
  });

  it('should skip validation for Array metatype', async () => {
    const value = [1, 2, 3];
    const metadata: ArgumentMetadata = { metatype: Array, type: 'body', data: '' };
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(value);
  });

  it('should skip validation for Object metatype', async () => {
    const value = { foo: 'bar' };
    const metadata: ArgumentMetadata = { metatype: Object, type: 'body', data: '' };
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(value);
  });
});
