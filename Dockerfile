FROM node:20-alpine
WORKDIR /app

# 设置环境变量
ENV NODE_ENV production
ENV TZ=Asia/Shanghai

# 安装必要的系统依赖
RUN apk add --no-cache tzdata

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 只复制必要的文件
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"] 