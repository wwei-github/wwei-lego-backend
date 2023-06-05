import { EggLogger } from 'egg';
import {
  Inject,
  HTTPController,
  HTTPMethod,
  HTTPMethodEnum,
  Context,
  EggContext,
} from '@eggjs/tegg';

@HTTPController({
  path: '/',
})
export class HomeController {
  @Inject()
  logger: EggLogger;

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/',
  })
  async index(@Context() ctx: EggContext) {
    ctx.helper.success({ ctx, resp: 111, message: 'success' });
  }
}
