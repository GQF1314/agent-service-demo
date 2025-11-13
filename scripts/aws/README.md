# Domus Agent Deployment

这个目录包含了部署domus-agent服务到ECS Fargate的所有必要文件。

## 文件说明

- `domus-agent-task-definition.json` - ECS任务定义，包含容器配置、环境变量、健康检查等
- `deploy-agent.sh` - 完整的部署脚本，包含任务定义注册和服务创建/更新
- `update-agent.sh` - 快速更新脚本，用于更新现有服务的镜像版本
- `agent-env.sh` - 环境变量配置脚本
- `agent-config.env` - 配置文件，包含所有基础设施参数

## 基础设施信息

当前配置基于现有的domus-cluster基础设施：

- **集群**: domus-cluster
- **VPC**: vpc-065087f3624f558d3
- **子网**: subnet-0374260798a029c6b, subnet-0972c3b87623da21a (私有子网)
- **安全组**: sg-00bfa42ff2c477486
- **服务发现**: agent.domus.local (ns-6t65cxkaq7n5qzgf)
- **ECR仓库**: 194160272412.dkr.ecr.us-east-1.amazonaws.com/domus-agent
- **Redis**: domus-redis.9zxv3l.ng.0001.use1.cache.amazonaws.com:6379

## 部署方式

### 1. 完整部署（首次部署或重新创建服务）

```bash
cd /Users/yz/code/domus_go/deployments/aws
./deploy-agent.sh
```

### 2. 快速更新（更新镜像版本）

```bash
# 使用latest标签
./update-agent.sh

# 使用特定标签
./update-agent.sh v1.2.3
```

### 4. 设置自动扩容

```bash
./setup-autoscaling.sh
```

### 3. 手动部署步骤

```bash
# 1. 加载环境变量
source agent-env.sh

# 2. 注册任务定义
aws ecs register-task-definition \
    --region us-east-1 \
    --cli-input-json file://domus-agent-task-definition.json

# 3. 更新服务
aws ecs update-service \
    --region us-east-1 \
    --cluster domus-cluster \
    --service domus-agent \
    --task-definition domus-agent:LATEST
```

## 服务配置

- **CPU**: 1024 (1 vCPU)
- **内存**: 1024 MB (1 GB)
- **架构**: ARM64
- **端口**: 8082
- **副本数**: 1 (默认)，自动扩容到2
- **自动扩容**: 基于CPU使用率70%触发
- **健康检查**: HTTP GET /healthz
- **日志**: CloudWatch Logs (/ecs/domus)

## 环境变量和密钥

服务使用以下环境变量：
- `SERVICE_NAME=agent`
- `PORT=8082`
- `LOG_LEVEL=info`
- `ENVIRONMENT=dev`
- `REDIS_URL=redis://domus-redis.9zxv3l.ng.0001.use1.cache.amazonaws.com:6379`

密钥通过AWS Secrets Manager管理：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_PASSWORD`
- `JWT_SECRET`

## 服务发现

服务通过AWS Cloud Map注册到`agent.domus.local`，其他服务可以通过此域名访问：

```
http://agent.domus.local:8082
```

## 监控和日志

- **CloudWatch Logs**: `/ecs/domus` 日志组，前缀 `agent`
- **健康检查**: 每30秒检查一次 `/healthz` 端点
- **服务指标**: 通过ECS控制台查看

## 故障排除

1. **检查服务状态**:
```bash
aws ecs describe-services --cluster domus-cluster --services domus-agent
```

2. **查看任务日志**:
```bash
aws logs tail /ecs/domus --follow --filter-pattern="agent"
```

3. **检查任务定义**:
```bash
aws ecs describe-task-definition --task-definition domus-agent
```

4. **重启服务**:
```bash
aws ecs update-service --cluster domus-cluster --service domus-agent --force-new-deployment
```
