#!/bin/bash

# shell 脚本发生错误时，即命令返回不等于0，则停止执行，并推出shell
set -e 

echo $MOGNO_INITDB_ROOT_USERNAME
echo $MONGO_INITDB_ROOT_PASSWORD
echo $MONGO_LEGODB_USERNAME
echo $MONGO_LEGODB_PASSWORD

# <<EOF 表示进入子终端执行命令 直到EOF表示退出子终端
mongosh <<EOF

use admin
db.auth('$MOGNO_INITDB_ROOT_USERNAME','$MONGO_INITDB_ROOT_PASSWORD')
use wwei-lego-database
db.createUser({
  user:'$MONGO_LEGODB_USERNAME',
  pwd:'$MONGO_LEGODB_PASSWORD',
  roles:[{
    role:'readWrite'
    db:'wwei-lego-database'
  }]
})


db.createCollection('users');
db['users'].insertOne({ id: 1, name: 'test' });

EOF
