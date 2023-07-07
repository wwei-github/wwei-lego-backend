import { Context } from 'egg';
import { EggAppConfig } from 'egg';
import { verify } from 'jsonwebtoken';

function getTokenValue(ctx, secret) {
  const header = ctx.header;
  const authorization = header.authorization;
  if (!authorization || typeof authorization !== 'string') {
    return false;
  }
  const authorArray = authorization.trim().split(' ');
  if (authorArray.length != 2 || !/^bearer$/.test(authorArray[0])) {
    return false;
  }
  try {
    const token = verify(authorArray[1], secret);
    return token;
  } catch (e) {
    ctx.logger.error(e);
    return false;
  }
}

export default (options: EggAppConfig['jwt']) => {
  return async (ctx: Context, next) => {
    const { secret } = options;
    if (!secret) {
      throw new Error('appConfig未配置secret');
    }
    const token = getTokenValue(ctx, secret);
    if (!token) {
      return ctx.helper.error({ ctx, errorType: 'tokenError' });
    }
    ctx.state.userToken = token;
    await next();
  };
};
