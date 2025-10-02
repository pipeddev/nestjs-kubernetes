import { ToStringUtils } from 'src/common/utils/to-string.util';

describe('ToStringUtils', () => {
  describe('toString', () => {
    it('should return "<null>" for null', () => {
      expect(ToStringUtils.toString(null)).toBe('<null>');
    });

    it('should return "<null>" for undefined', () => {
      expect(ToStringUtils.toString(undefined)).toBe('<null>');
    });

    it('should stringify a plain object', () => {
      const obj = { a: 1, b: 'test' };
      expect(ToStringUtils.toString(obj)).toBe('Object { a: 1, b: test }');
    });

    it('should stringify an array', () => {
      const arr = [1, 2, 3];
      // Array entries are [index, value]
      expect(ToStringUtils.toString(arr)).toBe('Array { 0: 1, 1: 2, 2: 3 }');
    });

    it('should stringify a custom class instance', () => {
      class MyClass {
        foo = 'bar';
        num = 42;
      }
      const instance = new MyClass();
      expect(ToStringUtils.toString(instance)).toBe('MyClass { foo: bar, num: 42 }');
    });

    it('should handle objects with no own properties', () => {
      class Empty {}
      const empty = new Empty();
      expect(ToStringUtils.toString(empty)).toBe('Empty {  }');
    });

    it('should handle objects with symbol properties (ignores them)', () => {
      const sym = Symbol('s');
      const obj = { a: 1 };
      (obj as Record<string | symbol, unknown>)[sym] = 'hidden';
      expect(ToStringUtils.toString(obj)).toBe('Object { a: 1 }');
    });

    it('should handle primitive values (number)', () => {
      // Object.entries(42) returns []
      expect(ToStringUtils.toString(42)).toBe('Number {  }');
    });

    it('should handle boolean values', () => {
      expect(ToStringUtils.toString(true)).toBe('Boolean {  }');
    });
  });
});
