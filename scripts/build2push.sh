#!/bin/bash

# 多环境部署脚本 - 与domus_go项目对应
# Usage: ./scripts/deploy.sh [prod|dev|local]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 获取当前git commit hash
GIT_COMMIT=$(git rev-parse --short HEAD)

# 获取环境参数，默认为prod
ENVIRONMENT=${1:-test}

# 验证环境参数
case $ENVIRONMENT in
    production|development|test)
        echo -e "${GREEN}🚀 开始部署到 $ENVIRONMENT 环境${NC}"
        ;;
    *)
        echo -e "${RED}❌ 无效的环境: $ENVIRONMENT${NC}"
        echo "Usage: $0 [prod|dev|local]"
        exit 1
        ;;
esac



# 显示配置信息
echo -e "${YELLOW}📋 当前配置:${NC}"
echo "  环境: $ENVIRONMENT"
echo "  Git Commit: $GIT_COMMIT"


# 构建并推送镜像到ECR
echo -e "${GREEN}🔨 构建Docker镜像...${NC}"
docker build --platform linux/amd64 -t domus-agent:latest -f docker/Dockerfile .

# 标记并推送到ECR
echo -e "${GREEN}📤 推送镜像到ECR...${NC}"
docker tag domus-agent:latest 194160272412.dkr.ecr.us-east-1.amazonaws.com/domus-agent:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 194160272412.dkr.ecr.us-east-1.amazonaws.com
docker push 194160272412.dkr.ecr.us-east-1.amazonaws.com/domus-agent:latest