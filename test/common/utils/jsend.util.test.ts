import { JSendUtil } from '../../../src/common/utils/jsend.util';

describe('JSendUtil', () => {
  describe('success', () => {
    it('should return a JSend success response with data', () => {
      const data = { foo: 'bar' };
      const result = JSendUtil.success(data);
      expect(result).toEqual({
        status: 'success',
        data,
      });
    });

    it('should work with primitive data', () => {
      const data = 123;
      const result = JSendUtil.success(data);
      expect(result).toEqual({
        status: 'success',
        data,
      });
    });
  });

  describe('fail', () => {
    it('should return a JSend fail response with data', () => {
      const data = { error: 'Invalid input' };
      const result = JSendUtil.fail(data);
      expect(result).toEqual({
        status: 'fail',
        data,
      });
    });

    it('should work with undefined data', () => {
      const result = JSendUtil.fail(undefined);
      expect(result).toEqual({
        status: 'fail',
        data: undefined,
      });
    });
  });

  describe('error', () => {
    it('should return a JSend error response with message only', () => {
      const message = 'Something went wrong';
      const result = JSendUtil.error(message);
      expect(result).toEqual({
        status: 'error',
        message,
      });
    });

    it('should include code if provided', () => {
      const message = 'Not found';
      const code = 404;
      const result = JSendUtil.error(message, code);
      expect(result).toEqual({
        status: 'error',
        message,
        code,
      });
    });

    it('should include data if provided', () => {
      const message = 'Validation failed';
      const data = { field: 'email' };
      const result = JSendUtil.error(message, undefined, data);
      expect(result).toEqual({
        status: 'error',
        message,
        data,
      });
    });

    it('should include code and data if both are provided', () => {
      const message = 'Unauthorized';
      const code = 401;
      const data = { reason: 'token expired' };
      const result = JSendUtil.error(message, code, data);
      expect(result).toEqual({
        status: 'error',
        message,
        code,
        data,
      });
    });

    it('should not include code if code is 0', () => {
      const message = 'Zero code';
      const code = 0;
      const result = JSendUtil.error(message, code);
      expect(result).toEqual({
        status: 'error',
        message,
      });
    });
  });
});
