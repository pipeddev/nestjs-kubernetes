import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

export class TraceLogger {
  private readonly logger: Logger;

  constructor(context?: string) {
    this.logger = new Logger(context ?? 'TraceLogger');
  }

  private getTraceId(): string {
    return randomUUID();
  }

  log(message: any): void {
    this.logger.log(`[${this.getTraceId()}] ${message}`);
  }

  error(message: any, trace?: string): void {
    this.logger.error(`[${this.getTraceId()}] ${message}`, trace);
  }

  warn(message: any): void {
    this.logger.warn(`[${this.getTraceId()}] ${message}`);
  }

  debug(message: any): void {
    this.logger.debug(`[${this.getTraceId()}] ${message}`);
  }

  verbose(message: any): void {
    this.logger.verbose(`[${this.getTraceId()}] ${message}`);
  }
}
