import { Controller } from 'egg';
import validateRuleError from '../decorator/validateRuleError';
import { PopulateOption, PopulateOptions } from 'mongoose';
import checkPermission from '../decorator/checkPermission';

const validateCreateRules = {
  title: { type: 'string', required: true },
};

// 参数类型
export interface IndexCondition {
  pageSize?: number;
  pageIndex?: number;
  select?: string | string[];
  populate?: PopulateOptions | (string | PopulateOptions)[]; // 关联的其他集合信息
  customSort?: Record<string, any>; // 排序
  find?: Record<string, any>; // 查询条件
}

export default class WorksController extends Controller {
  @validateRuleError(validateCreateRules, 'validateErrorMessage')
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

  async queryList() {
    const { ctx, service } = this;
    const { _id } = ctx.state.user;
    const { pageIndex, pageSize, isTemplate, title } = ctx.query;
    // 查找数据筛选想
    const findCondition = {
      user: _id,
      ...(title && { title: { $regex: title, $options: 'i' } }),
      ...(isTemplate && { isTemplate: !!+isTemplate }),
    };
    // 获取数据库字段
    const selectCondition: IndexCondition = {
      select: [
        'id',
        'author',
        'copiedCount',
        'coverImg',
        'desc',
        'title',
        'user',
        'isHot',
        'createdAt',
      ],
      populate: { path: 'user', select: 'username nickName picture' },
      find: findCondition,
      pageIndex: parseInt(pageIndex) || 0,
      pageSize: parseInt(pageSize) || 10,
    };

    try {
      const result = await service.workService.getList(selectCondition);
      return ctx.helper.success({ ctx, res: result });
    } catch (err) {
      return ctx.helper.error({ ctx, errorType: 'queryWorksErrorMessage' });
    }
  }
  async queryTemplateList() {
    const { ctx, service } = this;
    const { pageIndex, pageSize } = ctx.query;
    // 获取数据库字段
    const selectCondition: IndexCondition = {
      select: [
        'id',
        'author',
        'copiedCount',
        'coverImg',
        'desc',
        'title',
        'user',
        'isHot',
        'createdAt',
      ],
      populate: { path: 'user', select: 'username nickName picture' },
      find: { isTemplate: true, isPublic: true },
      pageIndex: parseInt(pageIndex) || 0,
      pageSize: parseInt(pageSize) || 10,
    };

    try {
      const result = await service.workService.getList(selectCondition);
      return ctx.helper.success({ ctx, res: result });
    } catch (err) {
      return ctx.helper.error({ ctx, errorType: 'queryWorksErrorMessage' });
    }
  }

  @checkPermission('Works', 'workNoPermissionErrorMessage')
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const body = ctx.request.body;
    try {
      const res = await ctx.model.Works.findOneAndUpdate({ id }, body, { new: true });
      return ctx.helper.success({ ctx, res });
    } catch (err) {
      return ctx.helper.error({ ctx, errorType: 'updateWorkErrorMessage' });
    }
  }

  @checkPermission('Works', 'workNoPermissionErrorMessage')
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;
    try {
      const res = await ctx.model.Works.findOneAndDelete({ id }).lean();
      return ctx.helper.success({ ctx, res: null, message: '删除成功' });
    } catch (err) {
      return ctx.helper.error({ ctx, errorType: 'deleteWorkErrorMessage' });
    }
  }
}
