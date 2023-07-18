# 安装基础镜像
FROM node:16-alpine
# 创建目录
RUN mkdir /usr/src/app
# 工作区，命令行执行目录
WORKDIR /usr/src/app
# 拷贝
COPY package.json pnpm.lock.yaml /usr/src/app/
RUN npm install pnpm -g
RUN pnpm i --registry=https://registry.npm.taobao.org
COPY . /usr/src/app/
RUN pnpm run tsc
EXPOSE 7001
CMD npx egg-scripts start --title=lego-backend