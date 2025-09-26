/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus } from '@nestjs/common';

export interface BusinessErrorOptions {
  message: string;
  code?: string;
  details?: any;
  status?: HttpStatus;
}

export class BusinessError extends HttpException {
  constructor(options: BusinessErrorOptions) {
    const {
      message,
      code = 'BUSINESS_RULE_VIOLATION',
      details = null,
      status = HttpStatus.BAD_REQUEST,
    } = options;

    super(
      {
        message,
        code,
        errors: details,
      },
      status,
    );
  }
}
