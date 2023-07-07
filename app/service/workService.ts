import { Service } from 'egg';
import { WorkProps } from '../model/Works';
import { nanoid } from 'nanoid';
import { IndexCondition, IndexDetailCondition } from '../controller/worksController';

class WorkService extends Service {
  async createWork(data) {
    const { ctx } = this;
    const { username, _id } = ctx.state.user;

    const newWork: Partial<WorkProps> = {
      ...data,
      uuid: nanoid(6),
      user: _id,
      author: username,
    };
    const result = await ctx.model.Works.create(newWork);
    return result;
  }
  async getDetail(optionCondition: IndexDetailCondition) {
    const { ctx } = this;
    const { find = {}, select = '', populate = [] } = optionCondition;
    const result = await ctx.model.Works.findOne(find).select(select).populate(populate).lean();
    return result;
  }

  async getList(optionCondition: IndexCondition) {
    const { ctx } = this;
    const {
      find = {},
      select = '',
      pageIndex = 0,
      pageSize = 10,
      populate = [],
      customSort,
    } = optionCondition;
    const skip = pageSize * pageIndex;
    const result = await ctx.model.Works.find(find)
      .skip(skip)
      .limit(pageSize)
      .select(select)
      .populate(populate)
      .sort(customSort)
      .lean();
    const count = await ctx.model.Works.find(find).count();
    return {
      pageIndex,
      pageSize,
      data: result,
      count,
    };
  }

  async publish(id: string, isTemplate: boolean = false) {
    const { ctx, app } = this;
    const { H5BaseUrl } = app.config;
    const data: Partial<WorkProps> = {
      status: 2,
      lastPublishedDate: new Date(),
      ...(isTemplate && { isTemplate }),
    };
    const res = await ctx.model.Works.findOneAndUpdate({ id }, data, { new: true });
    if (!res) return null;
    return `${H5BaseUrl}/p/${res.id}-${res?.uuid}`;
  }
}

export default WorkService;
