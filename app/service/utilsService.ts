import { Service } from 'egg';
import { createSSRApp } from 'vue';
import WweiComponents from 'wwei-components';
import { renderToString, renderToNodeStream } from '@vue/server-renderer';

export default class UtilsService extends Service {
  async renderToPageData(query: { id: string; uuid: string }) {
    const { ctx } = this;
    const work = await ctx.model.Works.findOne(query).lean();
    if (!work) {
      throw new Error('信息有误，无法展示页面');
    }
    const { title, desc, content } = work;
    console.log(content);
    const vueApp = createSSRApp({
      data: () => {
        return {
          components: (content && content.components) || [],
        };
      },
      template: '<final-page :components="components"></final-page>',
    });
    // vueApp.use(WweiComponents);
    const html = await renderToString(vueApp);
    return { html, title, desc };
  }
}
