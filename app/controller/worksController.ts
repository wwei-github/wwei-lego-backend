import { Controller } from 'egg';
import validateRuleError from '../decorator/validateRuleError';

const validationRules = {
  title: { type: 'string', required: true },
};

export default class WorksController extends Controller {
  @validateRuleError(validationRules, 'validateErrorMessage')
  async createEmptyWorkTemplate() {
    const { ctx } = this;

    const body = ctx.request.body;
    try {
      const work = await this.service.workService.createWork(body);
      return ctx.helper.success({ ctx, res: work });
    } catch (err) {
      return ctx.helper.error({ ctx, errorType: 'createWorkErrorMessage' });
    }
  }
}
