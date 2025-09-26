import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ContextType,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { JSendError, JSendFail } from '../types/jsend.types';

@Catch()
export class JSendExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(JSendExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if ((host.getType<ContextType>() as string) === 'graphql') {
      GqlArgumentsHost.create(host);
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let status: number;
    let jsendResponse: JSendError | JSendFail;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (status >= 400 && status < 500) {
        // Client errors - use 'fail' status
        jsendResponse = {
          status: 'fail',
          data:
            typeof exceptionResponse === 'string'
              ? { message: exceptionResponse }
              : exceptionResponse,
        };
      } else {
        // Server errors - use 'error' status
        jsendResponse = {
          status: 'error',
          message: exception.message,
          code: status,
        };
      }
    } else {
      // Unknown errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      jsendResponse = {
        status: 'error',
        message: 'Internal server error',
        code: status,
      };

      // Log unexpected errors
      this.logger.error('Unexpected error:', exception);
    }

    response.status(status).send(jsendResponse);
  }
}
