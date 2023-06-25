// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportUsersController from '../../../app/controller/usersController';
import ExportWorksController from '../../../app/controller/worksController';

declare module 'egg' {
  interface IController {
    usersController: ExportUsersController;
    worksController: ExportWorksController;
  }
}
