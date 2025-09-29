import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export class TraceLogger {
  private readonly logger: Logger;

  constructor(context?: string) {
    this.logger = new Logger(context ?? 'TraceLogger');
  }

  private getTraceId(): string {
    return uuidv4() as string;
  }

  log(message: any): void {
    const traceId = this.getTraceId();
    this.logger.log(`[${traceId}] ${message}`);
  }

  error(message: any, trace?: string): void {
    const traceId = this.getTraceId();
    this.logger.error(`[${traceId}] ${message}`, trace);
  }

  warn(message: any): void {
    const traceId = this.getTraceId();
    this.logger.warn(`[${traceId}] ${message}`);
  }

  debug(message: any): void {
    const traceId = this.getTraceId();
    this.logger.debug(`[${traceId}] ${message}`);
  }

  verbose(message: any): void {
    const traceId = this.getTraceId();
    this.logger.verbose(`[${traceId}] ${message}`);
  }
}
