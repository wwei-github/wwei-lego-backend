import { Service } from 'egg';
import { UserProps } from '../model/Users';

interface GiteeUserType {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
}

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
    let user = await this.findUserByUsername(phone);
    if (!user) {
      const newUser: Partial<UserProps> = {
        username: phone,
        nickName: `乐高-${phone.slice(-4)}`,
        phoneNumber: phone,
        registerType: 'phone',
      };
      user = await ctx.model.Users.create(newUser);
    }

    const token = app.jwt.sign({ username: phone, _id: user?._id }, app.config.jwt.secret, {
      expiresIn: app.config.jwtExpires,
    });
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
    return data.access_token;
  }
  public async getGtieeUserInfo(token: string) {
    const { ctx, app } = this;
    const { giteeUserInfoApi } = app.config.giteeOauthConfig;
    const { data } = await ctx.curl<GiteeUserType>(`${giteeUserInfoApi}?access_token=${token}`, {
      dataType: 'jsonp',
    });
    return data;
  }
  public async loginByGitee(code: string) {
    const { ctx, app } = this;
    const access_token = await this.getAccessToken(code);
    const { id, name, email, avatar_url } = await this.getGtieeUserInfo(access_token);
    const userName = `Gitee-${id}`;
    let userInfo = await this.findUserByUsername(userName);
    if (!userInfo) {
      const newUser: Partial<UserProps> = {
        username: userName,
        nickName: name,
        picture: avatar_url,
        email,
        oauthID: id,
        oauthType: 'gitee',
      };
      userInfo = await ctx.model.Users.create(newUser);
    }
    const token = app.jwt.sign({ username: userName, _id: userInfo?._id }, app.config.jwt.secret, {
      expiresIn: app.config.jwtExpires,
    });
    return token;
  }
}

export default UserService;
