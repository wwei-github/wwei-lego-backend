import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/api/users', app.jwt as any, controller.usersController.list);
  router.get('/api/users/detail/:id', controller.usersController.getUserById);
  router.post('/api/users/create', controller.usersController.createUserByEmail);
  router.post('/api/users/loginByPwd', controller.usersController.loginByPwd);
  router.post('/api/users/loginByPhoneCode', controller.usersController.loginByPhoneCode);
  router.get('/api/users/sendPhoneCode', controller.usersController.sendValidateCode);

  router.get('/api/users/loginOauthByGitee', controller.usersController.loginOauthByGitee);
  router.get('/api/users/loginGetOauthToken', controller.usersController.loginGetOauthToken);
};
