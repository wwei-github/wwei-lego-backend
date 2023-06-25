import { Controller } from 'egg';
import { ErrorMessageType } from '../errors';

export default function validateRuleError(
  rule: any,
  messageType: ErrorMessageType,
  dataType: 'body' | 'query' | 'all' = 'all'
) {
  return function (prototype, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const that = this as Controller;
      // @ts-ignore
      const { ctx, app } = that;
      let data;
      switch (dataType) {
        case 'query':
          data = ctx.request.query;
          break;
        case 'body':
          data = ctx.request.body;
          break;
        case 'all':
          data = { ...ctx.request.body, ...ctx.request.query };
          break;
      }
      const errors = app.validator.validate(rule, data);
      if (errors) {
        return ctx.helper.error({ ctx, errorType: messageType });
      }

      return originalMethod.call(that, ...args);
    };
  };
}
