import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.prefix('/api');

  router.get('/users', controller.usersController.list);
  router.get('/users/detail/:id', controller.usersController.getUserById);
  router.post('/users/create', controller.usersController.createUserByEmail);
  router.post('/users/loginByPwd', controller.usersController.loginByPwd);
  router.post('/users/loginByPhoneCode', controller.usersController.loginByPhoneCode);
  router.get('/users/sendPhoneCode', controller.usersController.sendValidateCode);
  // gitee oauth 授权登录
  router.get('/users/loginOauthByGitee', controller.usersController.loginOauthByGitee);
  router.get('/users/loginGetOauthToken', controller.usersController.loginGetOauthToken);

  // works
  router.post('/works', controller.worksController.createEmptyWorkTemplate);
  router.get('/works/list', controller.worksController.queryList);
  router.patch('/works/update/:id', controller.worksController.update);
  router.get('/works/delete/:id', controller.worksController.delete);
  router.get('/works/detail/:id', controller.worksController.detail);
  router.get('/works/publishTemplate/:id', controller.worksController.publishTemplate);
  router.get('/works/publishWork/:id', controller.worksController.publishWork);

  // 上传
  router.post('/utils/upload-img', controller.utilsController.uploadMultiple);

  router.get('/utils/page/:idAndUuid', controller.utilsController.renderH5SSR);
};
