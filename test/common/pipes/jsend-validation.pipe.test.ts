import { HttpException, HttpStatus, ArgumentMetadata } from '@nestjs/common';
import { IsString, IsInt, MinLength } from 'class-validator';
import { JSendValidationPipe } from 'src/common/pipes/jsend-validation.pipe';
import { JSendUtil } from 'src/common/utils/jsend.util';

// Mock JSendUtil
jest.mock('src/common/utils/jsend.util', () => ({
  JSendUtil: {
    fail: jest.fn((data: unknown) => ({ status: 'fail', data })),
  },
}));

// Sample DTO for validation
class TestDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsInt()
  age: number;
}

describe('JSendValidationPipe', () => {
  let pipe: JSendValidationPipe;

  beforeEach(() => {
    pipe = new JSendValidationPipe();
    jest.clearAllMocks();
  });

  const argumentMeta: ArgumentMetadata = {
    type: 'body',
    metatype: TestDto,
    data: '',
  };

  it('should return value if metatype is not provided', async () => {
    const value = { foo: 'bar' };
    const result = await pipe.transform(value, { type: 'body' });
    expect(result).toBe(value);
  });

  it('should return value if metatype is primitive', async () => {
    const value = 'test';
    const result = await pipe.transform(value, { type: 'body', metatype: String });
    expect(result).toBe(value);
  });

  it('should throw HttpException if value is null', async () => {
    await expect(pipe.transform(null, argumentMeta)).rejects.toThrow(HttpException);
    expect(JSendUtil.fail).toHaveBeenCalledWith({ message: 'No valid data provided' });
  });

  it('should throw HttpException if value is undefined', async () => {
    await expect(pipe.transform(undefined, argumentMeta)).rejects.toThrow(HttpException);
    expect(JSendUtil.fail).toHaveBeenCalledWith({ message: 'No valid data provided' });
  });

  it('should return transformed object if validation passes', async () => {
    const value = { name: 'John', age: 30 };
    const result = await pipe.transform(value, argumentMeta);
    expect(result).toBeInstanceOf(TestDto);
    expect(result).toMatchObject(value);
  });

  it('should throw HttpException with formatted errors if validation fails', async () => {
    const value = { name: 'Jo', age: 'not-a-number' };
    try {
      await pipe.transform(value, argumentMeta);
      fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect((e as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      const response = (e as HttpException).getResponse() as {
        status: string;
        data: Record<string, unknown>;
      };
      expect(response).toHaveProperty('status', 'fail');
      expect(response).toHaveProperty('data');
      const data = response.data;
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('age');
      expect(Array.isArray(data.name)).toBe(true);
      expect(Array.isArray(data.age)).toBe(true);
    }
  });

  it('should format nested validation errors', () => {
    // Simulate nested error
    // Import ValidationError at the top if not already imported:
    // import { ValidationError } from 'class-validator';
    const errors: import('class-validator').ValidationError[] = [
      {
        property: 'nested',
        constraints: undefined,
        children: [
          {
            property: 'foo',
            constraints: { isString: 'foo must be a string' },
            children: [],
          },
        ],
      },
    ];

    const formatted = (
      pipe as unknown as {
        formatErrors: (
          errors: import('class-validator').ValidationError[],
        ) => Record<string, string[]>;
      }
    ).formatErrors(errors);
    expect(formatted).toEqual({ 'nested.foo': ['foo must be a string'] });
  });
});
