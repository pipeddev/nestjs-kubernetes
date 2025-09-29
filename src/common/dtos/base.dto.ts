import { validate } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';

export class BaseDTO {
  /**
   * Lista de campos que se enmascararán al serializar para logs.
   * Sobrescribir en subclases: `static redacted = ['password', 'ssn']`
   */
  static redacted: string[] = [];

  /**
   * Convierte el DTO a string seguro para logging (usa enmascarado).
   */
  toString(): string {
    try {
      return `${this.constructor.name}: ${BaseDTO.safeStringify(this.toJSON())}`;
    } catch {
      return `${this.constructor.name}: [Error serializando objeto]`;
    }
  }

  /**
   * Convierte la instancia a un objeto plano y aplica enmascarado.
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
   * Valida la instancia usando class-validator. Devuelve errores o null si es válido.
   */
  async validateSelf() {
    const errors = await validate(this as object);
    return errors.length ? errors : null;
  }

  /**
   * Crea una instancia del DTO desde un objeto plano (usa class-transformer).
   */
  static fromPlain<T extends BaseDTO>(Ctor: ClassConstructor<T>, plain: Record<string, any>): T {
    return plainToInstance(Ctor, plain);
  }

  /**
   * Clona la instancia actual (respetando transformaciones).
   */
  clone<T extends BaseDTO>(): T {
    const Ctor = this.constructor as new () => T;
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
