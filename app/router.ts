import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  const jwtMiddleware = app.jwt as any;

  router.get('/api/users', jwtMiddleware, controller.usersController.list);
  router.get('/api/users/detail/:id', controller.usersController.getUserById);
  router.post('/api/users/create', controller.usersController.createUserByEmail);
  router.post('/api/users/loginByPwd', controller.usersController.loginByPwd);
  router.post('/api/users/loginByPhoneCode', controller.usersController.loginByPhoneCode);
  router.get('/api/users/sendPhoneCode', controller.usersController.sendValidateCode);
  // gitee oauth 授权登录
  router.get('/api/users/loginOauthByGitee', controller.usersController.loginOauthByGitee);
  router.get('/api/users/loginGetOauthToken', controller.usersController.loginGetOauthToken);

  // works
  router.post('/api/works', jwtMiddleware, controller.worksController.createEmptyWorkTemplate);
  router.get('/api/works/list', jwtMiddleware, controller.worksController.queryList);
  router.post('/api/works/update/:id', jwtMiddleware, controller.worksController.update);
  router.get('/api/works/delete/:id', jwtMiddleware, controller.worksController.delete);
  router.get(
    '/api/works/publishTemplate/:id',
    jwtMiddleware,
    controller.worksController.publishTemplate
  );
  router.get('/api/works/publishWork/:id', jwtMiddleware, controller.worksController.publishWork);

  // 上传
  router.post('/api/utils/upload', controller.utilsController.uploadFileByStream);
};
