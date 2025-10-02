import { TraceLogger } from 'src/common/logger/trace.logger';
import { Logger } from '@nestjs/common';

jest.mock('@nestjs/common', (): typeof import('@nestjs/common') => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actual = jest.requireActual('@nestjs/common');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...actual,
    Logger: jest.fn().mockImplementation(() => ({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    })),
  };
});

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-trace-id'),
}));

describe('TraceLogger', () => {
  let traceLogger: TraceLogger;
  let loggerInstance: jest.Mocked<Logger>;

  beforeEach(() => {
    (Logger as unknown as jest.Mock).mockClear();
    traceLogger = new TraceLogger('TestContext');
    loggerInstance = (Logger as unknown as jest.Mock).mock.results[0].value as jest.Mocked<Logger>;
  });

  it('should initialize with provided context', () => {
    expect(Logger).toHaveBeenCalledWith('TestContext');
  });

  it('should initialize with default context if none provided', () => {
    new TraceLogger();
    expect(Logger).toHaveBeenCalledWith('TraceLogger');
  });

  it('should log messages with trace id', () => {
    traceLogger.log('test message');
    expect(loggerInstance.log).toHaveBeenCalledWith('[mock-trace-id] test message');
  });

  it('should log error messages with trace id and trace', () => {
    traceLogger.error('error message', 'stacktrace');
    expect(loggerInstance.error).toHaveBeenCalledWith(
      '[mock-trace-id] error message',
      'stacktrace',
    );
  });

  it('should log warnings with trace id', () => {
    traceLogger.warn('warn message');
    expect(loggerInstance.warn).toHaveBeenCalledWith('[mock-trace-id] warn message');
  });

  it('should log debug messages with trace id', () => {
    traceLogger.debug('debug message');
    expect(loggerInstance.debug).toHaveBeenCalledWith('[mock-trace-id] debug message');
  });

  it('should log verbose messages with trace id', () => {
    traceLogger.verbose('verbose message');
    expect(loggerInstance.verbose).toHaveBeenCalledWith('[mock-trace-id] verbose message');
  });
});
