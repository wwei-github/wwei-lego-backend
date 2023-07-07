import { createMongoAbility, AbilityBuilder } from '@casl/ability';
import { UserProps } from './../model/Users';
import { Document } from 'mongoose';

export default function defineRoles(user: UserProps & Document<any, any, UserProps>) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  if (user) {
    if (user.role === 'admin') {
      // 拥有所有权限
      can('manage', 'all');
    } else {
      // normal 只能更改自己的字段
      // users
      can('read', 'Users', { _id: user._id });
      can('update', 'Users', ['nickName', 'picture'], { _id: user._id });
      // works
      can('create', 'Works', ['title', 'desc', 'content', 'coverImg']); //可以创建这些字段
      can('read', 'Works', { 'user._id': user._id }); // 只可以读取自己的帖子
      can('update', 'Works', ['title', 'desc', 'content', 'coverImg']); //可以更新这些字段
      can('delete', 'Works', { 'user._id': user._id }); //可以删除自己的
      can('publish', 'Works', { 'user._id': user._id }); //可以推送自己的

      // channels
      // can('create', 'Channel', ['name', 'workId']); //可以创建这些字段
      // can('read', 'Channel', { user: user._id }); // 只可以读取自己的帖子
      // can('update', 'Channel', ['name']); //可以更新这些字段
      // can('delete', 'Channel', ['name'], { user: user._id }); //可以删除自己的
    }
  }
  return build();
}
