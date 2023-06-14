import { Context } from 'egg';

export default () => {
  return async (ctx: Context, next) => {
    try {
      await next();
    } catch (e) {
      const error = e as any;
      if (error && error.status == 401) {
        ctx.helper.error({ ctx, errorType: 'tokenError' });
      } else {
        throw error;
      }
    }
  };
};
