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

    if (value === null || value === undefined) {
      throw new HttpException(
        JSendUtil.fail({ message: 'No valid data provided' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    const objectType = metatype as ClassConstructor<T>;
    const object = plainToClass(objectType, value);

    // Especificamos que object es de tipo T para la validación
    const errors = await validate(object as unknown as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const validationErrors = this.formatErrors(errors);
      throw new HttpException(JSendUtil.fail(validationErrors), HttpStatus.BAD_REQUEST);
    }

    return object;
  }

  private toValidate(metatype: new (...args: any[]) => any): boolean {
    const types: Array<new (...args: any[]) => any> = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): ValidationErrorResponse {
    const result: ValidationErrorResponse = {};

    errors.forEach((error) => {
      if (error.property) {
        if (error.constraints) {
          result[error.property] = Object.values(error.constraints);
        }

        // Manejar errores anidados
        if (error.children && error.children.length > 0) {
          const nestedErrors = this.formatErrors(error.children);
          for (const [key, value] of Object.entries(nestedErrors)) {
            result[`${error.property}.${key}`] = value;
          }
        }
      }
    });

    return result;
  }
}
