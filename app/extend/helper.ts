import type { Context } from 'egg';
import { ErrorMessageType, allErrorMessage } from '../errors';

interface SuccessOptions {
  ctx: Context;
  res: any;
  message?: string;
}

interface ErrorOptions {
  ctx: Context;
  errorType: ErrorMessageType;
  message?: string;
}

export default {
  success({ ctx, res, message }: SuccessOptions) {
    ctx.body = {
      error: 0,
      data: res || null,
      message: message || '请求成功',
    };
    ctx.status = 200;
  },
  error({ ctx, errorType, message }: ErrorOptions) {
    ctx.body = {
      error: allErrorMessage[errorType].error,
      message: allErrorMessage[errorType].message,
      errorInfo: message || '请求失败',
    };
    ctx.status = 200;
  },
};
