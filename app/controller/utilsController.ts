import { Controller } from 'egg';
import sharp from 'sharp';
import { createReadStream, createWriteStream } from 'fs';
import { parse, join, extname } from 'path';
import { nanoid } from 'nanoid';

export default class UtilsController extends Controller {
  async fileUpload() {
    const { ctx, app } = this;
    const { filepath } = ctx.request.files[0];

    const img = sharp(filepath);
    const imgMetadata = await img.metadata();
    let imgThumbnailUrl = '';
    if (imgMetadata.width && imgMetadata.width > 300) {
      const { name, ext, dir } = parse(filepath);
      const imgThumbnailPath = join(dir, `${name}-thumbnail${ext}`);
      await img.resize({ width: 300 }).toFile(imgThumbnailPath);
      imgThumbnailUrl = imgThumbnailPath.replace(app.baseDir, app.config.H5BaseUrl);
    }

    const url = filepath.replace(app.baseDir, app.config.H5BaseUrl);
    ctx.helper.success({ ctx, res: { url, imgThumbnailUrl } });
  }

  replacePath(filepath: string) {
    const { app } = this;
    return filepath.replace(app.baseDir, app.config.H5BaseUrl);
  }

  async uploadFileByStream() {
    const { ctx, app } = this;
    // 获取文件流
    const readFileStream = await ctx.getFileStream();
    const ext = extname(readFileStream.filename);
    const fileUuid = nanoid(6);
    // 文件保存的地址
    const saveFilePath = join(app.config.baseDir, 'uploads', fileUuid + ext);
    const saveFileThumbnailPath = join(
      app.config.baseDir,
      'uploads',
      fileUuid + '_thumbnail' + ext
    );

    // 创建写入流
    const writeFileStream = createWriteStream(saveFilePath);
    const writeThumbnailFileStream = createWriteStream(saveFileThumbnailPath);

    // promise 封装流
    const fileSaveStream = new Promise((resolve, reject) => {
      readFileStream.pipe(writeFileStream).on('finish', resolve).on('error', reject);
    });

    const transformFile = sharp().resize({ width: 300 });
    const fileThumbnailSaveStream = new Promise((resolve, reject) => {
      readFileStream
        .pipe(transformFile)
        .pipe(writeThumbnailFileStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    await Promise.all([fileSaveStream, fileThumbnailSaveStream]);
    ctx.helper.success({
      ctx,
      res: {
        url: this.replacePath(saveFilePath),
        imgThumbnailUrl: this.replacePath(saveFileThumbnailPath),
      },
    });
  }
}
