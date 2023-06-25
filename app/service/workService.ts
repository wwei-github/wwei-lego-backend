import { Service } from 'egg';
import { WorkProps } from '../model/Works';
import { nanoid } from 'nanoid';

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
}

export default WorkService;
