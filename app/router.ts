import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.redirect('/', '/users');
  router.get('/users', controller.usersController.list);
};
