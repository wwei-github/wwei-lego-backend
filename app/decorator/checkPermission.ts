import { Controller } from 'egg';
import { ErrorMessageType } from '../errors';
import defineRoles from '../roles/roles';
import { subject } from '@casl/ability';
import { permittedFieldsOf } from '@casl/ability/extra';
import { difference, assign } from 'lodash/fp';

interface ModelMapping {
  mongoose: string;
  casl: string;
}
interface IOptions {
  action: string;
  key: string; // 默认为id
  value: { type: 'params' | 'body'; valueKey: string };
}
// {id:URLSearchParams.id}
// {'channels.id':ctx.params.id}
// {"channels.id":ctx.request.body.workId}

const defaultSearchOptions: Partial<IOptions> = {
  key: 'id',
  value: { type: 'params', valueKey: 'id' },
};

const caslMethodMapping = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete',
};

const fieldsOptions = { fieldsFrom: rule => rule.fields || [] };

/**
 *
 * @param modelName model的名称
 * @param messageType 返回的错误类型
 * @param options 特殊的配置项
 * @return function
 */
export default function checkPermission(
  modelName: string | ModelMapping,
  messageType: ErrorMessageType,
  options?: Partial<IOptions>
) {
  return function (prototype, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const that = this as Controller;
      // @ts-ignore
      const { ctx, app } = that;
      const searchOptions: IOptions = assign(defaultSearchOptions, options || {});
      const { key, value } = searchOptions;
      const { type, valueKey } = value;

      const source = type === 'params' ? ctx.params : ctx.request.body;
      const query = {
        [key]: source[valueKey],
      };
      // {id:URLSearchParams.id}
      // {'channels.id':ctx.params.id}
      // {"channels.id":ctx.request.body.workId}

      const mongooseModelName = typeof modelName === 'string' ? modelName : modelName.mongoose;
      const caslModelName = typeof modelName === 'string' ? modelName : modelName.casl;

      const { method } = ctx.request;
      const action = options && options.action ? options.action : caslMethodMapping[method];

      if (!ctx.state || !ctx.state.user) {
        return ctx.helper.error({ ctx, errorType: messageType });
      }

      // 获取定义的roles
      const ability = defineRoles(ctx.state.user);
      // 先判断是否有特殊的判断 比如 {_id:user._id}
      const rule = ability.relevantRuleFor(action, modelName);

      let permission = false;
      let keyPermission = false;

      if (rule && rule.conditions) {
        const findInfo = await ctx.model[mongooseModelName].findOne(query).lean();
        if (!findInfo) {
          return ctx.helper.error({ ctx, errorType: messageType });
        }
        permission = ability.can(action, subject(caslModelName, findInfo));
      } else {
        permission = ability.can(action, modelName);
      }
      // 判断rule中是否有受限字段
      if (rule && rule.fields) {
        const fields = permittedFieldsOf(ability, action, modelName, fieldsOptions);
        if (fields.length > 0) {
          // 判断是否有多余的key
          const payloadKeys = Object.keys(ctx.request.body);
          const diffKeys = difference(payloadKeys, fields);
          keyPermission = diffKeys.length === 0;
        }
      }

      if (!permission || !keyPermission) {
        return ctx.helper.error({ ctx, errorType: messageType });
      }
      return originalMethod.call(that, ...args);
    };
  };
}
