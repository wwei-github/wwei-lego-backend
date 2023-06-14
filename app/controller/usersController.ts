import { Controller } from 'egg';
import { sign, verify } from 'jsonwebtoken';

export const userErrorMessage = {
  userInfoError: {
    error: 101001,
    message: '账号或者密码输入错误,请检查后重试',
  },
  userAlreadyCreateError: {
    error: 101002,
    message: '该邮箱已注册,请进行登录操作',
  },
  tokenError: {
    error: 101003,
    message: '登录已过期，请登录后操作',
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
    return ctx.helper.success({ ctx, res: result });
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
}
