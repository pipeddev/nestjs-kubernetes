import { Reflector } from '@nestjs/core';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';

import { GqlExecutionContext } from '@nestjs/graphql';
import { JSendInterceptor } from 'src/common/interceptors/jsend.interceptor';
import { JSEND_RESPONSE_KEY } from 'src/common/decorators/jsend-response.decorator';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('JSendInterceptor', () => {
  let interceptor: JSendInterceptor;
  let reflector: Reflector;
  let context: ExecutionContext;
  let callHandler: CallHandler;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    interceptor = new JSendInterceptor(reflector);
    context = {} as ExecutionContext;
    callHandler = { handle: jest.fn() } as CallHandler;
  });

  it('should pass through if context is GraphQL', () => {
    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getType: () => 'graphql',
    });
    const handleSpy = jest.fn(() => of('graphqlData'));
    callHandler.handle = handleSpy;

    const result$ = interceptor.intercept(context, callHandler);
    expect(handleSpy).toHaveBeenCalled();
    return result$.toPromise().then((data) => {
      expect(data).toBe('graphqlData');
    });
  });

  it('should pass through if JSEND is not enabled', async () => {
    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getType: () => 'http',
    });
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const handleSpy = jest.fn(() => of('plainData'));
    callHandler.handle = handleSpy;

    // Mock getHandler and getClass for context
    context = {
      ...context,
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as Partial<ExecutionContext> as ExecutionContext;

    const result$ = interceptor.intercept(context, callHandler);
    expect(handleSpy).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: string = await firstValueFrom(result$);
    expect(data).toBe('plainData');
  });

  it('should wrap response in JSEND format if enabled', async () => {
    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getType: () => 'http',
    });
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    callHandler.handle = jest.fn(() => of({ foo: 'bar' }));

    // Mock getHandler and getClass for context
    context = {
      ...context,
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as Partial<ExecutionContext> as ExecutionContext;

    const result$ = interceptor.intercept(context, callHandler);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await firstValueFrom(result$);
    expect(data).toEqual({
      status: 'success',
      data: { foo: 'bar' },
    });
  });

  it('should call reflector.getAllAndOverride with correct params', () => {
    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getType: () => 'http',
    });
    const handler = jest.fn();
    const clazz = jest.fn();
    (context as Partial<ExecutionContext>).getHandler = () => handler;
    (context as Partial<ExecutionContext>).getClass = () => clazz;
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    callHandler.handle = jest.fn(() => of('data'));

    interceptor.intercept(context, callHandler).subscribe();
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(JSEND_RESPONSE_KEY, [handler, clazz]);
  });
});
