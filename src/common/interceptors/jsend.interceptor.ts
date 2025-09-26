import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JSEND_RESPONSE_KEY } from '../decorators/jsend-response.decorator';
import { JSendSuccess } from '../types/jsend.types';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JSendInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    if (gqlContext.getType() === 'graphql') {
      return next.handle(); // GraphQL maneja sus propios errores
    }

    const isJSendEnabled = this.reflector.getAllAndOverride<boolean>(JSEND_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isJSendEnabled) {
      return next.handle();
    }

    return next.handle().pipe(
      map(
        (data): JSendSuccess => ({
          status: 'success',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data,
        }),
      ),
    );
  }
}
