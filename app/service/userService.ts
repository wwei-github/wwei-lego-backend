import { Service } from 'egg';
import { UserProps } from '../model/Users';

export class UserService extends Service {
  public async queryUsers() {
    return await this.app.model.Users.find().exec();
  }
  public async createUserByEmail(payload: UserProps) {
    const { ctx } = this;
    const { username, password } = payload;
    const userData: Partial<UserProps> = {
      username,
      password,
      email: username,
    };
    return await ctx.model.Users.create(userData);
  }
  public async findUserById(id: string) {
    const { ctx } = this;
    return ctx.model.Users.findById(id);
  }
  public async findUserByUsername(username: string) {
    const { ctx } = this;
    return ctx.model.Users.findOne({ username });
  }
}

export default UserService;
