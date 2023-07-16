import { Controller } from 'egg';
import validateRuleError from '../decorator/validateRuleError';

const validateUserInfoInput = {
  username: { type: 'email', required: true },
  password: { type: 'password', required: true, min: 8 },
};
const validatePhoneInput = {
  userPhone: {
    require: true,
    type: 'string',
    format:
      /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/,
  },
};

export default class UsersController extends Controller {
  public async list() {
    const { ctx } = this;
    try {
      const data = await this.service.userService.queryUsers();
      ctx.helper.success({ ctx, res: data, message: 'success' });
    } catch (e) {
      this.logger.error(e);
      ctx.helper.error({ ctx, errorType: 'userInfoError' });
    }
  }

  @validateRuleError(validateUserInfoInput, 'userInfoError')
  public async createUserByEmail() {
    const { ctx, service } = this;
    const body = ctx.request.body;

    const checkAlreadyCreated = await service.userService.findUserByUsername(body.username);
    if (checkAlreadyCreated) {
      return ctx.helper.error({ ctx, errorType: 'userAlreadyCreateError' });
    }
    body.password = await ctx.genHash(body.password);
    const result = await service.userService.createUserByEmail(body);
    return ctx.helper.success({ ctx, res: result });
  }

  public async getUserById() {
    const { ctx, service } = this;
    const id = this.ctx.params.id;
    const result = await service.userService.findUserById(id);
    if (result) {
      return ctx.helper.success({ ctx, res: result });
    }
    return ctx.helper.error({ ctx, errorType: 'userIdIsNullError' });
  }

  @validateRuleError(validateUserInfoInput, 'userInfoError')
  public async loginByPwd() {
    const { ctx, app } = this;
    const body = ctx.request.body;

    const userInfo = await this.service.userService.findUserByUsername(body.username);
    if (!userInfo) {
      return ctx.helper.error({ ctx, errorType: 'userInfoError' });
    }
    const validatePwd = await ctx.compare(body.password, userInfo.password);
    if (validatePwd) {
      // ctx.cookies.set('username', userInfo.username, { encrypt: true });
      // ctx.session.username = userInfo.username;
      const token = app.jwt.sign(
        { username: userInfo.username, _id: userInfo._id },
        app.config.jwt.secret,
        {
          expiresIn: app.config.jwtExpires,
        }
      );
      return ctx.helper.success({ ctx, message: '登录成功', res: token });
    }
    return ctx.helper.error({ ctx, errorType: 'userInfoError' });
  }

  @validateRuleError(validatePhoneInput, 'phoneValidateError')
  public async sendValidateCode() {
    const { ctx, app } = this;
    const { userPhone } = ctx.request.query;

    const code = Math.floor(Math.random() * 9000 + 1000);
    const codeKey = `phoneVeriCode-${userPhone}`;
    const isAlreadySend = await app.redis.get(codeKey);
    if (isAlreadySend) {
      return ctx.helper.error({ ctx, errorType: 'sendCodeIsMoreError' });
    }
    if (app.config.env == 'prod') {
      // 生产发送短信服务
    }
    app.redis.set(codeKey, code, 'ex', 60 * 2);
    return ctx.helper.success({ ctx, res: app.config.env == 'local' ? { userPhone, code } : null });
  }

  @validateRuleError(validatePhoneInput, 'phoneValidateError')
  public async loginByPhoneCode() {
    const { ctx, app } = this;
    const { userPhone, code } = ctx.request.body;

    const preCode = await app.redis.get(`phoneVeriCode-${userPhone}`);
    if (code !== preCode) {
      return ctx.helper.error({ ctx, errorType: 'codeValidateError' });
    }

    const token = await ctx.service.userService.loginUserByPhone(userPhone);
    return ctx.helper.success({ ctx, res: { token } });
  }

  async loginOauthByGitee() {
    const { ctx, app } = this;
    const { clientId, redirectUrl } = app.config.giteeOauthConfig;
    ctx.redirect(
      `https://gitee.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code`
    );
  }
  async loginGetOauthToken() {
    const { ctx, service } = this;
    const { code } = ctx.request.query;
    try {
      const token = await service.userService.loginByGitee(code);
      await ctx.render('loginSuccess.nj', { token });
      // return ctx.helper.success({ ctx, res: { token } });
    } catch (e: any) {
      ctx.helper.error({ ctx, errorType: 'giteeOauthLoginError', message: e.message });
    }
  }
}
