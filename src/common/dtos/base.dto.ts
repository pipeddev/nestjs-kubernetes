import { validate } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';

export class BaseDTO {
  /**
   * List of fields that will be redacted when serializing for logs.
   * Override in subclasses: `static redacted = ['password', 'ssn']`
   */
  static redacted: string[] = [];

  /**
   * Convert the DTO to a safe string for logging (applies redaction).
   */
  toString(): string {
    try {
      return `${this.constructor.name}: ${BaseDTO.safeStringify(this.toJSON())}`;
    } catch {
      return `${this.constructor.name}: [Error serializando objeto]`;
    }
  }

  /**
   * Convert the instance to a plain object and apply redaction.
   */
  toJSON(): Record<string, any> {
    const obj = { ...this } as Record<string, any>;
    const ctor = this.constructor as typeof BaseDTO;
    const redacted = ctor.redacted ?? [];
    for (const key of redacted) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = '[REDACTED]';
      }
    }
    return obj;
  }

  /**
   * Validate the instance using class-validator. Returns errors or null if valid.
   */
  async validateSelf() {
    const errors = await validate(this as object);
    return errors.length ? errors : null;
  }

  /**
   * Create a DTO instance from a plain object (uses class-transformer).
   */
  static fromPlain<T extends BaseDTO>(Ctor: ClassConstructor<T>, plain: Record<string, any>): T {
    return plainToInstance(Ctor, plain);
  }

  /**
   * Clone the current instance (respecting transformations).
   */
  clone<T extends BaseDTO>(): T {
    const Ctor = this.constructor as ClassConstructor<T>;
    return BaseDTO.fromPlain(Ctor, this.toJSON());
  }

  private static safeStringify(obj: unknown): string {
    const cache = new Set<unknown>();
    try {
      return JSON.stringify(obj, (_key: string, value: unknown): unknown => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) return '[Circular]';
          cache.add(value);
        }
        return value;
      });
    } catch {
      return '[Unserializable]';
    } finally {
      cache.clear();
    }
  }
}
