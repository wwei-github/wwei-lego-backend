import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config = {} as PowerPartial<EggAppConfig>;
 
  config.H5BaseUrl = 'http://localhost:7002';

  return config;
};
