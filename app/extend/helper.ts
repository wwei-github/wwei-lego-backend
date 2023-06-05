import type { Context } from 'egg';

interface SuccessOptions {
  ctx: Context;
  resp: any;
  message?: string;
}

export default {
  success({ ctx, resp, message }: SuccessOptions) {
    ctx.body = {
      error: 0,
      data: resp || null,
      message: message || '请求成功',
    };
    ctx.status = 200;
  },
};
