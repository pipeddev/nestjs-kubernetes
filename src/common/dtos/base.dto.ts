import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ToStringUtils } from '../utils/to-string.util';

export abstract class BaseDTO {
  static redacted: string[] = [];

  /**
   * Convert the DTO to a safe string for logging (applies redaction).
   */
  toString(): string {
    return ToStringUtils.toString(this);
  }

  /**
   * Create a DTO instance from a plain object (uses class-transformer).
   */
  static fromPlain<T extends BaseDTO>(Ctor: ClassConstructor<T>, plain: Record<string, any>): T {
    return plainToInstance(Ctor, plain);
  }
}
