import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config = {} as PowerPartial<EggAppConfig>;

  // redis mongoose 配置
  config.redis = {
    client: {
      port: 6379, // Redis port
      host: 'lego-redis', // Redis host
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : undefined,
    },
  };

  // 正式允许域名访问
  config.security = {
    domainWhiteList: ['http://imooc-lego.com', 'https://www.imooc-lego.com'],
  };

  // 过期时间
  config.jwtExpires = '2 days';

  // oauth 重定向地址
  config.giteeOauthConfig = {
    redirectUrl: 'http://api.immoc-lego.com/api/users/loginGetOauthToken',
  };

  console.log('MONGO_LEGODB_USERNAME', process.env.MONGO_LEGODB_USERNAME);
  config.mongoose = {
    clients: {
      mongodb_1: {
        url: 'mongodb://lego-mongo:27017/wwei-lego-database',
        options: {
          user: process.env.MONGO_LEGODB_USERNAME || '',
          pass: process.env.MONGO_LEGODB_PASSWORD || '',
        },
        // mongoose global plugins, expected a function or an array of function and options
      },
    },
  };

  config.H5BaseUrl = 'https://h5.imooc-lego.com';
  return config;
};
