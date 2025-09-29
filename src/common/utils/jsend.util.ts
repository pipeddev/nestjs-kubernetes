import { JSendSuccess, JSendFail, JSendError } from '../types/jsend.types';

export class JSendUtil {
  static success<T>(data: T): JSendSuccess<T> {
    return {
      status: 'success',
      data,
    };
  }

  static fail<T = unknown>(data: T): JSendFail<T> {
    return {
      status: 'fail',
      data,
    };
  }

  static error(message: string, code?: number, data?: unknown): JSendError {
    return {
      status: 'error',
      message,
      ...(code && { code }),
      ...(typeof data !== 'undefined' ? { data } : {}),
    };
  }
}
