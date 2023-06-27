import { Controller } from 'egg';
import { ErrorMessageType } from '../errors';

export default function checkPermission(modelName: string, messageType: ErrorMessageType) {
  return function (prototype, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const that = this as Controller;
      // @ts-ignore
      const { ctx, app } = that;
      const { id } = ctx.params;
      const { _id } = ctx.state.user;
      const findInfo = await ctx.model[modelName].findOne({ id });
      if (!findInfo) {
        return ctx.helper.error({ ctx, errorType: messageType });
      }
      const userId = findInfo.user.toString();
      if (userId !== _id) {
        return ctx.helper.error({ ctx, errorType: messageType });
      }
      return originalMethod.call(that, ...args);
    };
  };
}
