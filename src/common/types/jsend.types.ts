export interface JSendSuccess<T = unknown> {
  status: 'success';
  data: T;
}

export interface JSendFail<T = unknown> {
  status: 'fail';
  data: T;
}

export interface JSendError<T = unknown> {
  status: 'error';
  message: string;
  code?: number;
  data?: T;
}

export type JSendResponse<T = unknown> = JSendSuccess<T> | JSendFail<T> | JSendError<T>;

export interface ValidationFailData {
  message: string;
  errors: Array<Record<string, string[]>>;
}

export type ValidationFailResponse = JSendFail<ValidationFailData>;
