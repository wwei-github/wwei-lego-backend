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

  public async login() {
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

  validateUserPhone() {
    const { ctx, app } = this;
    const validation = {
      userPhone: {
        require: true,
        type: 'string',
        format:
          /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/,
      },
    };
    return app.validator.validate(validation, ctx.request.query);
  }

  public async sendValidateCode() {
    const { ctx, app } = this;
    const { userPhone } = ctx.request.query;
    const error = this.validateUserPhone();
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'phoneValidateError' });
    }
    const code = Math.floor(Math.random() * 9000 + 1000);
    const codeKey = `${userPhone}-validate-code`;
    const isAlreadySend = await app.redis.get(codeKey);
    if (isAlreadySend) {
      return ctx.helper.error({ ctx, errorType: 'sendCodeIsMoreError' });
    }
    app.redis.set(codeKey, code, 'ex', 60);
    return ctx.helper.success({ ctx, res: { userPhone, code } });
  }
}
