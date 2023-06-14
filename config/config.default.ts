import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

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
    domainWhiteList: ['http://127.0.0.1:7002'],
  };

  config.bcrypt = {
    saltRounds: 10,
  };

  config.mongoose = {
    clients: {
      mongodb_1: {
        url: 'mongodb://wwei:ww13030370329@118.89.84.196:27017/wwei-lego-database?authMechanism=DEFAULT&authSource=wwei-lego-database',
        options: {},
        // mongoose global plugins, expected a function or an array of function and options
      },
    },
  };

  config.jwt = {
    secret: 'asdqwetefsfas123xasdaf',
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // the return config will combines to EggAppConfig
  return {
    ...(config as {}),
    ...bizConfig,
  };
};
