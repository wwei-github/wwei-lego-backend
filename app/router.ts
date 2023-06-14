import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/api/users', app.jwt as any, controller.usersController.list);
  router.get('/api/users/:id', controller.usersController.getUserById);
  router.post('/api/users/create', controller.usersController.createUserByEmail);
  router.post('/api/users/login', controller.usersController.login);
};
