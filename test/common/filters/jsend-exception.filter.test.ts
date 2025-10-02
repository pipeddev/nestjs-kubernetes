import { JSendExceptionFilter } from '../../../src/common/filters/jsend-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { JSendUtil } from '../../../src/common/utils/jsend.util';

jest.mock('../../../src/common/utils/jsend.util');

const mockLoggerError = jest.fn();
jest.mock('@nestjs/common', () => {
  const actual: typeof import('@nestjs/common') = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    Logger: jest.fn().mockImplementation(() => ({
      error: mockLoggerError,
    })),
  };
});

describe('JSendExceptionFilter', () => {
  let filter: JSendExceptionFilter;
  let mockResponse: { status: jest.Mock; send: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new JSendExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockHost = {
      getType: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ArgumentsHost;

    (JSendUtil.error as jest.Mock).mockImplementation(
      (message: string, code: number, data?: unknown) => ({
        status: 'error',
        message,
        code,
        ...(data ? { data } : {}),
      }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should rethrow exception if context is graphql', () => {
    (mockHost.getType as jest.Mock).mockReturnValue('graphql');
    const error = new Error('GraphQL error');
    expect(() => filter.catch(error, mockHost)).toThrow(error);
  });

  it('should handle HttpException with 4xx status as fail', () => {
    (mockHost.getType as jest.Mock).mockReturnValue('http');
    const exceptionResponse = { foo: 'bar' };
    const httpException = new HttpException(exceptionResponse, 400);

    filter.catch(httpException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith({
      status: 'fail',
      data: exceptionResponse,
    });
  });

  it('should handle HttpException with 4xx status and string response as fail', () => {
    (mockHost.getType as jest.Mock).mockReturnValue('http');
    const httpException = new HttpException('Not Found', 404);

    filter.catch(httpException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.send).toHaveBeenCalledWith({
      status: 'fail',
      data: { message: 'Not Found' },
    });
  });

  it('should handle HttpException with 5xx status as error', () => {
    (mockHost.getType as jest.Mock).mockReturnValue('http');
    const httpException = new HttpException('Server Error', 500);

    filter.catch(httpException, mockHost);

    expect(JSendUtil.error).toHaveBeenCalledWith('Server Error', 500);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith({
      status: 'error',
      message: 'Server Error',
      code: 500,
    });
  });

  it('should handle HttpException with 5xx status and object response as error', () => {
    (mockHost.getType as jest.Mock).mockReturnValue('http');
    const httpException = new HttpException({ error: 'Internal Error' }, 503);

    filter.catch(httpException, mockHost);

    expect(JSendUtil.error).toHaveBeenCalledWith('Http Exception', 503);
    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.send).toHaveBeenCalledWith({
      status: 'error',
      message: 'Http Exception',
      code: 503,
    });
  });

  it('should handle unknown Error as error and log it', () => {
    (mockHost.getType as jest.Mock).mockReturnValue('http');
    const error = new Error('Unexpected failure');

    filter.catch(error, mockHost);

    expect(JSendUtil.error).toHaveBeenCalledWith(
      'Unexpected failure',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { message: 'Unexpected failure' },
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.send).toHaveBeenCalledWith({
      status: 'error',
      message: 'Unexpected failure',
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      data: { message: 'Unexpected failure' },
    });
    expect(mockLoggerError).toHaveBeenCalledWith('Unexpected error occurred:', {
      message: 'Unexpected failure',
      stack: error.stack,
      exception: error,
    });
  });

  it('should handle non-Error unknown exception', () => {
    (mockHost.getType as jest.Mock).mockReturnValue('http');
    const unknownException = 'String exception';

    filter.catch(unknownException, mockHost);

    expect(JSendUtil.error).toHaveBeenCalledWith(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      undefined,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockLoggerError).toHaveBeenCalledWith('Unexpected error occurred:', {
      message: 'Internal server error',
      stack: 'No stack trace available',
      exception: unknownException,
    });
  });

  it('should handle HttpException with empty message for 5xx status', () => {
    (mockHost.getType as jest.Mock).mockReturnValue('http');
    const httpException = new HttpException('', 500);

    filter.catch(httpException, mockHost);

    expect(JSendUtil.error).toHaveBeenCalledWith('Internal Server Error', 500);
  });

  it('should handle null/undefined exception', () => {
    (mockHost.getType as jest.Mock).mockReturnValue('http');

    filter.catch(null, mockHost);

    expect(JSendUtil.error).toHaveBeenCalledWith(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      undefined,
    );
    expect(mockLoggerError).toHaveBeenCalled();
  });
});
