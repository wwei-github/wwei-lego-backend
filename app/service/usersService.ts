import { Service } from 'egg';
import { Schema } from 'mongoose';

export class UsersService extends Service {
  /**
   * request hacker-news api
   * @param api - Api name
   * @param opts - urllib options
   */
  public async queryUsers() {
    const UsersSchema = new Schema({ user: { type: 'string' } }, { collection: 'users' });
    const model = this.app.mongoose.models.Users || this.app.mongoose.model('Users', UsersSchema);
    return await model.find().exec();
  }
}

export default UsersService;
