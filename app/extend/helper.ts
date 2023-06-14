import type { Context } from 'egg';
import { userErrorMessage } from '../controller/usersController';

interface SuccessOptions {
  ctx: Context;
  res: any;
  message?: string;
}
interface ErrorOptions {
  ctx: Context;
  errorType: keyof typeof userErrorMessage;
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
  error({ ctx, errorType }: ErrorOptions) {
    ctx.body = {
      error: userErrorMessage[errorType].error,
      message: userErrorMessage[errorType].message || '请求失败',
    };
    ctx.status = 200;
  },
};
