source .env
# 获取当前git commit hash
GIT_COMMIT=$(git rev-parse --short HEAD)

# 构建
echo "Building Docker image with tag: $GIT_COMMIT"
docker build -t domus-agent:$GIT_COMMIT -f docker/Dockerfile .

# 标记tag
echo "Tagging and pushing to ECR..."
docker tag domus-agent:$GIT_COMMIT 194160272412.dkr.ecr.us-east-1.amazonaws.com/domus-agent:$GIT_COMMIT

docker run -it --rm -p $PORT:$PORT --add-host=host.docker.internal:host-gateway domus-agent:$GIT_COMMIT