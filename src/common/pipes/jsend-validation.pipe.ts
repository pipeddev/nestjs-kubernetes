import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { JSendUtil } from '../utils/jsend.util';

// Interfaz para el formato de errores
interface ValidationErrorResponse {
  [key: string]: string[];
}

@Injectable()
export class JSendValidationPipe implements PipeTransform {
  async transform<T>(value: T, { metatype }: ArgumentMetadata): Promise<T> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype as ClassConstructor<unknown>, value);
    const errors = await validate(object as object);

    if (errors.length > 0) {
      const validationErrors = this.formatErrors(errors);
      throw new HttpException(JSendUtil.fail(validationErrors), HttpStatus.BAD_REQUEST);
    }

    return value;
  }

  private toValidate(metatype: new (...args: any[]) => any): boolean {
    const types: Array<new (...args: any[]) => any> = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): ValidationErrorResponse {
    const result: ValidationErrorResponse = {};

    errors.forEach((error) => {
      if (error.property && error.constraints) {
        result[error.property] = Object.values(error.constraints);
      }
    });

    return result;
  }
}
