import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Controller } from 'egg';
// import sharp from 'sharp';
import { parse, join, extname } from 'path';
import { nanoid } from 'nanoid';
import * as streamWormhole from 'stream-wormhole';
import { FileStream } from '../../typings/app';

export default class UtilsController extends Controller {
  // async fileUpload() {
  //   const { ctx, app } = this;
  //   const { filepath } = ctx.request.files[0];

  //   const img = sharp(filepath);
  //   const imgMetadata = await img.metadata();
  //   let imgThumbnailUrl = '';
  //   if (imgMetadata.width && imgMetadata.width > 300) {
  //     const { name, ext, dir } = parse(filepath);
  //     const imgThumbnailPath = join(dir, `${name}-thumbnail${ext}`);
  //     await img.resize({ width: 300 }).toFile(imgThumbnailPath);
  //     imgThumbnailUrl = imgThumbnailPath.replace(app.baseDir, app.config.H5BaseUrl);
  //   }

  //   const url = filepath.replace(app.baseDir, app.config.H5BaseUrl);
  //   ctx.helper.success({ ctx, res: { url, imgThumbnailUrl } });
  // }

  replacePath(filepath: string) {
    const { app } = this;
    return filepath.replace(app.baseDir, app.config.H5BaseUrl);
  }

  // async uploadFileByStream() {
  //   const { ctx, app } = this ;
  //   // 获取文件流
  //   const readFileStream = await ctx.getFileStream();
  //   const ext = extname(readFileStream.filename);
  //   const fileUuid = nanoid(6);
  //   // 文件保存的地址
  //   const saveFilePath = join(app.config.baseDir, 'uploads', fileUuid + ext);
  //   const saveFileThumbnailPath = join(
  //     app.config.baseDir,
  //     'uploads',
  //     fileUuid + '_thumbnail' + ext
  //   );

  //   // 创建写入流
  //   const writeFileStream = createWriteStream(saveFilePath);
  //   const writeThumbnailFileStream = createWriteStream(saveFileThumbnailPath);

  //   // promise 封装流
  //   const fileSaveStream = pipeline(readFileStream, writeFileStream);
  //   const transformFile = sharp().resize({ width: 300 });
  //   const fileThumbnailSaveStream = pipeline(
  //     readFileStream,
  //     transformFile,
  //     writeThumbnailFileStream
  //   );
  //   try {
  //     await Promise.all([fileSaveStream, fileThumbnailSaveStream]);
  //     ctx.helper.success({
  //       ctx,
  //       res: {
  //         url: this.replacePath(saveFilePath),
  //         imgThumbnailUrl: this.replacePath(saveFileThumbnailPath),
  //       },
  //     });
  //   } catch (e) {
  //     ctx.helper.error({ ctx, errorType: 'uploadFileError' });
  //   }
  // }

  // 阿里云上传文件到oss
  async uploadFileToOss() {
    const { ctx } = this;
    const stream = await ctx.getFileStream();
    try {
      const filePath = join('wwei-lego', `${nanoid(6)}${extname(stream.filename)}`);
      const result = await ctx.oss.put(filePath, stream);
      const { name, url } = result;
      ctx.helper.success({ ctx, res: { name, url } });
    } catch (e) {
      await streamWormhole(stream);
      ctx.helper.error({ ctx, errorType: 'uploadFileError' });
    }
  }

  // 多文件上传，原理是co-busboy
  async uploadMultiple() {
    const { ctx, app } = this;
    const { fileSize } = app.config.multipart;
    const parts = ctx.multipart({
      limits: {
        fileSize: fileSize as number,
      },
    });
    let urls: { url: string; name: string }[] = [];
    let part: FileStream | string[];
    while ((part = await parts())) {
      if (Array.isArray(part)) {
        ctx.logger.info(part);
      } else {
        const filePath = join('wwei-lego', `${nanoid(6)}${extname(part.filename)}`);
        try {
          const result = await ctx.oss.put(filePath, part);
          const { url, name } = result;
          urls.push({ url, name });
          // 判断上传上限
          if (part.truncated) {
            await ctx.oss.delete(filePath);
            return ctx.helper.error({
              ctx,
              errorType: 'uploadImageSizeError',
              message: `图片大小上限为${fileSize}bytes`,
            });
          }
        } catch (e) {
          await streamWormhole(part);
          ctx.helper.error({ ctx, errorType: 'uploadFileError' });
        }
      }
    }
    ctx.helper.success({ ctx, res: { url: urls } });
  }

  splitIdAndUuid(str) {
    const result = { id: '', uuid: '' };
    if (!str) return result;
    const index = str.indexOf('-');
    if (index === -1) return result;
    result.id = str.slice(0, index);
    result.uuid = str.slice(index + 1);
    return result;
  }
  async renderH5SSR() {
    const { ctx } = this;
    const { idAndUuid } = ctx.params;
    const query = this.splitIdAndUuid(idAndUuid);
    try {
      const pageData = await ctx.service.utilsService.renderToPageData(query);
      await ctx.render('template.nj', pageData);
    } catch (e: any) {
      ctx.helper.error({ ctx, errorType: 'renderSSRNoWorkError', message: e.message });
    }
  }
}
