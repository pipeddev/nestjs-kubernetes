import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ContextType,
} from '@nestjs/common';
import { JSendError, JSendFail } from '../types/jsend.types';
import { JSendUtil } from '../utils/jsend.util';

interface FastifyResponse {
  status(code: number): FastifyResponse;
  send(payload: unknown): FastifyResponse;
}
@Catch()
export class JSendExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(JSendExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if ((host.getType<ContextType>() as string) === 'graphql') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyResponse>();

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
        jsendResponse = JSendUtil.error(exception.message || 'Internal Server Error', status);
      }
    } else {
      // Unknown errors - use JSend 'error' status
      status = HttpStatus.INTERNAL_SERVER_ERROR;

      const errorMessage = exception instanceof Error ? exception.message : 'Internal server error';
      const data = exception instanceof Error ? { message: exception.message } : undefined;
      jsendResponse = JSendUtil.error(errorMessage, status, data);

      // Log unexpected errors with more detail
      this.logger.error('Unexpected error occurred:', {
        message: errorMessage,
        stack: exception instanceof Error ? exception.stack : 'No stack trace available',
        exception,
      });
    }

    response.status(status).send(jsendResponse);
  }
}
