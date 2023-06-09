import { Controller } from 'egg';

export default class UsersController extends Controller {
  public async list() {
    const { ctx } = this;
    try {
      const data = await this.service.usersService.queryUsers();
      ctx.helper.success({ ctx, resp: data, message: 'success' });
    } catch (e) {
      this.logger.error(e);
    }
  }
}
