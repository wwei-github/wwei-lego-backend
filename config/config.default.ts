import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import 'dotenv/config';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1685973644012_9183';

  // add your egg config in here
  config.middleware = ['errorMiddleware'];

  config.security = {
    csrf: {
      enable: false,
    },
    // domainWhiteList: ['http://127.0.0.1:7002', 'https://gitee.com/'],
  };

  config.bcrypt = {
    saltRounds: 10,
  };

  config.redis = {
    client: {
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined, // Redis port
      host: process.env.REDIS_HOST, // Redis host
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : undefined,
    },
  };

  config.mongoose = {
    clients: {
      mongodb_1: {
        url: process.env.MONGODB_URL || '',
        options: {},
        // mongoose global plugins, expected a function or an array of function and options
      },
    },
  };

  config.jwt = {
    secret: process.env.JWT_SECRET,
  };

  const giteeOauthConfig = {
    clientId: process.env.GITEE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GITEE_OAUTH_CLIENT_SECRET,
    redirectUrl: 'http://localhost:7002/api/users/loginGetOauthToken',
    authUrl: 'https://gitee.com/oauth/token?grant_type=authorization_code',
  };
  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    giteeOauthConfig,
  };

  // the return config will combines to EggAppConfig
  return {
    ...(config as {}),
    ...bizConfig,
  };
};
