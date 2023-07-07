// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportErrorMiddleware from '../../../app/middleware/errorMiddleware';
import ExportJwtCustom from '../../../app/middleware/jwtCustom';

declare module 'egg' {
  interface IMiddleware {
    errorMiddleware: typeof ExportErrorMiddleware;
    jwtCustom: typeof ExportJwtCustom;
  }
}
