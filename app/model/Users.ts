import { Application } from 'egg';
import { Connection } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

export interface UserProps {
  username: string;
  password: string;
  email?: string;
  nickName?: string;
  picture?: string;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
  registerType: 'email' | 'phone' | 'oauth';
  oauthID?: string;
  oauthType?: 'gitee';
  role?: 'admin' | 'normal';
}

function initUsersModel(app: Application) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const conn: Connection = app.mongooseDB.get('mongodb_1');
  const AutoIncrement = AutoIncrementFactory(conn);

  const UserSchema = new Schema<UserProps>(
    {
      username: { type: String, unique: true, required: true },
      password: { type: String },
      email: { type: String },
      nickName: { type: String },
      picture: { type: String },
      phoneNumber: { type: String },
      registerType: { type: String, default: 'email' },
      oauthID: { type: String },
      oauthType: { type: String },
      role: { type: String, default: 'normal' },
    },
    {
      collection: 'users',
      timestamps: true,
      toJSON: {
        transform: (doc, res) => {
          delete res.password;
          delete res.__v;
        },
      },
    }
  );
  UserSchema.plugin(AutoIncrement, {
    inc_field: 'id',
    id: 'users_id_counter',
  });

  return conn.model<UserProps>('Users', UserSchema);
}

export default initUsersModel;
