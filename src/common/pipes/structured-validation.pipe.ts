import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Logger,
  Type,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass, ClassConstructor } from 'class-transformer';
import { JSendUtil } from '../utils/jsend.util';

interface FieldError {
  [fieldName: string]: string[];
}

@Injectable()
export class StructuredValidationSafePipe implements PipeTransform<unknown> {
  private readonly logger = new Logger(StructuredValidationSafePipe.name);

  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype as ClassConstructor<object>, value as object);
    const errors = await validate(object);

    if (errors.length > 0) {
      const structuredErrors = this.formatErrors(errors);

      throw new HttpException(
        JSendUtil.fail({
          message: 'Validation failed',
          errors: structuredErrors,
        }),
        HttpStatus.BAD_REQUEST,
      );
    }

    return object;
  }

  private toValidate(metatype: Type<unknown>): boolean {
    const types: Type<unknown>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): FieldError[] {
    const result: FieldError[] = [];

    for (const error of errors) {
      if (error.constraints) {
        const fieldError: FieldError = {
          [error.property]: Object.values(error.constraints),
        };
        result.push(fieldError);
      }

      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatNestedErrors(error.property, error.children);
        result.push(...nestedErrors);
      }
    }

    return result;
  }

  private formatNestedErrors(parentProperty: string, children: ValidationError[]): FieldError[] {
    const result: FieldError[] = [];

    for (const child of children) {
      const nestedKey = `${parentProperty}.${child.property}`;

      if (child.constraints) {
        const fieldError: FieldError = {
          [nestedKey]: Object.values(child.constraints),
        };
        result.push(fieldError);
      }

      if (child.children && child.children.length > 0) {
        const deeperErrors = this.formatNestedErrors(nestedKey, child.children);
        result.push(...deeperErrors);
      }
    }

    return result;
  }
}
