import 'egg';
import { Model } from 'mongoose';

declare module 'egg' {
  interface MongooseModels extends IModel {
    [key: string]: Model<any>;
  }
  interface EggAppConfig {
    bcrypt?: {
      saltRounds: number;
    };
  }
  interface Context {
    genHash: (plainText: string) => Promise<string>;
    compare: (plainText: string, hash: string) => Promise<string>;
  }
}
