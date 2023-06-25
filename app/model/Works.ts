import AutoIncrementFactory from 'mongoose-sequence';
import { Application } from 'egg';
import { Connection, ObjectId } from 'mongoose';

export interface WorkProps {
  uuid: string;
  title: string;
  desc: string;
  coverImg: string;
  content: { [key: string]: string };
  isTemplate: boolean;
  isPublic: boolean;
  isHot: boolean;
  author: string;
  copiedCount: number;
  status: 0 | 1 | 2;
  user: ObjectId;
}

function initWorksModal(app: Application) {
  const mongoose = app.mongoose;
  const connection: Connection = app.mongooseDB.get('mongodb_1');
  const Schema = mongoose.Schema;
  const AutoIncrement = new AutoIncrementFactory(connection);

  const WorkSchema = new Schema<WorkProps>(
    {
      uuid: { type: String, unique: true },
      title: { type: String },
      desc: { type: String },
      coverImg: { type: String },
      content: { type: Object },
      isTemplate: { type: Boolean },
      isPublic: { type: Boolean },
      isHot: { type: Boolean },
      author: { type: String },
      copiedCount: { type: Number, default: 0 },
      status: { type: Number, default: 1 },
      user: { type: Schema.Types.ObjectId, ref: 'Users' },
    },
    { timestamps: true, collection: 'works' }
  );

  WorkSchema.plugin(AutoIncrement, {
    inc_field: 'id',
    id: 'works_id_counter',
  });

  return connection.model<WorkProps>('Works', WorkSchema);
}

export default initWorksModal;
