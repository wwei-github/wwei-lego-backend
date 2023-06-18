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
  public async loginUserByPhone(phone: string) {
    const { ctx, app } = this;
    const user = this.findUserByUsername(phone);
    if (!user) {
      const newUser: Partial<UserProps> = {
        username: phone,
        nickName: `乐高-${phone.slice(-4)}`,
        phoneNumber: phone,
        registerType: 'phone',
      };
      await ctx.model.Users.create(newUser);
    }

    const token = app.jwt.sign({ username: phone }, app.config.jwt.secret);
    return token;
  }

  public async getAccessToken(code: string) {
    const { ctx, app } = this;
    const { clientId, clientSecret, redirectUrl, authUrl } = app.config.giteeOauthConfig;
    // &code={code}&client_id={client_id}&redirect_uri={redirect_uri}&client_secret={client_secret}
    const { data } = await ctx.curl(authUrl, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: {
        code,
        client_id: clientId,
        redirect_uri: redirectUrl,
        client_secret: clientSecret,
      },
    });
    return data;
  }
}

export default UserService;
