#!/bin/bash

# 配置信息
SSH_ALIAS="huos"           # 修改为你的 SSH 别名
SERVER_PATH="/root/deploy"  # 修改为你的部署目录
IMAGE_NAME="next-mt"
IMAGE_TAG="latest"
CONTAINER_NAME="next-mt"
PORT=3000

# 先在本地构建项目
echo "🛠️ 开始本地构建..."
# pnpm build

# 构建镜像
echo "🚀 开始构建 Docker 镜像..."
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

# 保存镜像到文件
echo "📦 保存镜像到文件..."
docker save ${IMAGE_NAME}:${IMAGE_TAG} > ${IMAGE_NAME}.tar

# 压缩镜像文件以加快传输
echo "🗜️ 压缩镜像文件..."
gzip ${IMAGE_NAME}.tar

# 传输压缩后的镜像到服务器
echo "📤 传输镜像到服务器..."
scp ${IMAGE_NAME}.tar.gz ${SSH_ALIAS}:${SERVER_PATH}

# 在服务器上执行部署
echo "🎯 在服务器上部署..."
ssh ${SSH_ALIAS} "
    cd ${SERVER_PATH} && \
    gunzip ${IMAGE_NAME}.tar.gz && \
    docker load < ${IMAGE_NAME}.tar && \
    docker stop ${CONTAINER_NAME} 2>/dev/null || true && \
    docker rm ${CONTAINER_NAME} 2>/dev/null || true && \
    docker run -d \
        --name ${CONTAINER_NAME} \
        -p ${PORT}:${PORT} \
        --restart unless-stopped \
        ${IMAGE_NAME}:${IMAGE_TAG} && \
    rm ${IMAGE_NAME}.tar
"

# 清理本地镜像文件
echo "🧹 清理本地文件..."
rm ${IMAGE_NAME}.tar.gz

echo "✅ 部署完成！" 