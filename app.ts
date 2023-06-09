// app.ts
import assert from 'assert';
import { Application, IBoot } from 'egg';
import { createConnection, Connection } from 'mongoose';

export default class FooBoot implements IBoot {
  private readonly app: Application;
  mongoose: Connection;

  constructor(app: Application) {
    this.app = app;
    const { url } = this.app.config.mongoose;
    assert(url, '[egg-mongoose] url is required on config');
    const db = createConnection(url);
    db.on('connection', () => {
      app.logger.info('[egg-mongoose] connection successfully');
    });
    app.mongoose = db;
  }

  configWillLoad() {
    // Ready to call configDidLoad,
    // Config, plugin files are referred,
    // this is the last chance to modify the config.
  }

  configDidLoad() {
    // Config, plugin files have loaded.
  }

  async didLoad() {
    // All files have loaded, start plugin here.
  }

  async willReady() {
    // All plugins have started, can do some thing before app ready.
  }

  async didReady() {
    // Worker is ready, can do some things
    // don't need to block the app boot.
  }

  async serverDidReady() {
    // Server is listening.
  }

  async beforeClose() {
    // Do some thing before app close.
  }
}
