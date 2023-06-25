// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportUsers from '../../../app/model/Users';
import ExportWorks from '../../../app/model/Works';

declare module 'egg' {
  interface IModel {
    Users: ReturnType<typeof ExportUsers>;
    Works: ReturnType<typeof ExportWorks>;
  }
}
