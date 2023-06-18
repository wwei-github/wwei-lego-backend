import { Controller } from 'egg';

export const userErrorMessage = {
  userInfoError: {
    error: 101001,
    message: '账号或者密码输入错误,请检查后重试',
  },
  userIdIsNullError: {
    error: 101005,
    message: '未查询到用户信息',
  },
  userAlreadyCreateError: {
    error: 101002,
    message: '该邮箱已注册,请进行登录操作',
  },
  tokenError: {
    error: 101003,
    message: '登录已过期，请登录后操作',
  },
  phoneValidateError: {
    error: 101004,
    message: '手机号格式错误',
  },
  sendCodeIsMoreError: {
    error: 101005,
    message: '请勿频繁发送短信',
  },
  codeValidateError: {
    error: 101006,
    message: '验证码错误',
  },
};

export default class UsersController extends Controller {
  private validateUserInput() {
    const { ctx, app } = this;
    const body = ctx.request.body;
    const validation = {
      username: { type: 'email', required: true },
      password: { type: 'password', required: true, min: 8 },
    };
    const errors = app.validator.validate(validation, body);
    return errors;
  }

  public async list() {
    const { ctx } = this;
    try {
      const data = await this.service.userService.queryUsers();
      ctx.helper.success({ ctx, res: ctx.state.user, message: 'success' });
    } catch (e) {
      this.logger.error(e);
      ctx.helper.error({ ctx, errorType: 'userInfoError' });
    }
  }
  public async createUserByEmail() {
    const { ctx, service } = this;
    const body = ctx.request.body;

    const errors = this.validateUserInput();

    if (errors) {
      return ctx.helper.error({ ctx, errorType: 'userInfoError' });
    }
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

  public async loginByPwd() {
    const { ctx, app } = this;
    const body = ctx.request.body;

    const errors = this.validateUserInput();

    if (errors) {
      return ctx.helper.error({ ctx, errorType: 'userInfoError' });
    }

    const userInfo = await this.service.userService.findUserByUsername(body.username);
    if (!userInfo) {
      return ctx.helper.error({ ctx, errorType: 'userInfoError' });
    }
    const validatePwd = await ctx.compare(body.password, userInfo.password);
    if (validatePwd) {
      // ctx.cookies.set('username', userInfo.username, { encrypt: true });
      // ctx.session.username = userInfo.username;
      const token = app.jwt.sign({ username: userInfo.username }, app.config.jwt.secret, {
        expiresIn: 60 * 60,
      });
      return ctx.helper.success({ ctx, message: '登录成功', res: token });
    }
    return ctx.helper.error({ ctx, errorType: 'userInfoError' });
  }

  validateUserPhone(phone) {
    const { ctx, app } = this;
    const validation = {
      validPhone: {
        require: true,
        type: 'string',
        format:
          /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/,
      },
    };
    return app.validator.validate(validation, { validPhone: phone });
  }

  public async sendValidateCode() {
    const { ctx, app } = this;
    const { userPhone } = ctx.request.query;
    const error = this.validateUserPhone(userPhone);
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'phoneValidateError' });
    }
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

  public async loginByPhoneCode() {
    const { ctx, app } = this;
    const { phone, code } = ctx.request.body;
    const error = this.validateUserPhone(phone);
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'phoneValidateError' });
    }

    const preCode = await app.redis.get(`phoneVeriCode-${phone}`);
    if (code !== preCode) {
      return ctx.helper.error({ ctx, errorType: 'codeValidateError' });
    }

    const token = await ctx.service.userService.loginUserByPhone(phone);
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
    const { ctx, app, service } = this;
    const { code } = ctx.request.query;
    const token = await service.userService.getAccessToken(code);
    if (token) {
      return ctx.helper.success({ ctx, res: { token } });
    }
  }
}
