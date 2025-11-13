# AWS构建部署脚本说明

本目录包含了用于AWS环境的构建和部署脚本。

## 脚本文件

### 1. aws-build-deploy.sh
完整的AWS构建部署脚本，包含代码检出、构建推送和部署功能。

**使用方法：**
```bash
# 部署到test环境（默认）
./scripts/aws/aws-build-deploy.sh

# 部署到指定环境
./scripts/aws/aws-build-deploy.sh production

# 部署指定分支到指定环境
./scripts/aws/aws-build-deploy.sh production main
```

**功能：**
- ✅ 检查必要工具（git, docker, aws cli）
- ✅ 验证AWS凭证
- ✅ 检出指定分支代码
- ✅ 调用build2push.sh构建推送镜像
- ✅ 调用update-agent.sh部署镜像
- ✅ 显示部署状态和摘要

### 2. ci-build-deploy.sh
简化的CI/CD构建部署脚本，适用于GitHub Actions等自动化环境。

**使用方法：**
```bash
# 部署到test环境
./scripts/aws/ci-build-deploy.sh

# 部署到指定环境
./scripts/aws/ci-build-deploy.sh production
```

### 3. GitHub Actions工作流
`.github/workflows/aws-deploy.yml` 文件提供了完整的GitHub Actions工作流配置。

**触发条件：**
- 推送到main分支 → 部署到production环境
- 推送到develop分支 → 部署到development环境
- 其他分支 → 部署到test环境

## 环境配置

### 必需的环境变量
```bash
# AWS凭证
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1

# ECR仓库
ECR_REPOSITORY=domus-agent
ECR_REGISTRY=194160272412.dkr.ecr.us-east-1.amazonaws.com
```

### GitHub Secrets配置
在GitHub仓库设置中添加以下Secrets：
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## 架构配置

### Docker镜像架构
- 所有构建脚本都明确指定为 `linux/amd64` 平台（x86_64架构）
- 与ECS任务定义的 `X86_64` 架构保持一致

### ECS配置
- 任务定义：`domus-agent-task-definition.json`
- CPU架构：`X86_64`
- 操作系统：`LINUX`

## 使用流程

### 本地开发部署
```bash
# 1. 确保AWS凭证已配置
aws configure

# 2. 运行完整部署流程
./scripts/aws/aws-build-deploy.sh test

# 3. 检查部署状态
aws ecs describe-services --cluster domus-cluster --services domus-agent-service
```

### CI/CD自动部署
1. 推送代码到GitHub仓库
2. GitHub Actions自动触发构建和部署
3. 查看Actions页面了解部署状态

## 故障排除

### 常见问题

1. **AWS凭证问题**
   ```bash
   # 检查AWS凭证
   aws sts get-caller-identity
   ```

2. **Docker权限问题**
   ```bash
   # 确保用户有Docker权限
   sudo usermod -aG docker $USER
   ```

3. **ECS服务状态检查**
   ```bash
   # 查看服务状态
   aws ecs describe-services --cluster domus-cluster --services domus-agent-service
   
   # 查看任务状态
   aws ecs list-tasks --cluster domus-cluster --service-name domus-agent-service
   ```

4. **镜像推送失败**
   ```bash
   # 重新登录ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 194160272412.dkr.ecr.us-east-1.amazonaws.com
   ```

## 日志查看

### ECS服务日志
```bash
# 查看CloudWatch日志
aws logs describe-log-groups --log-group-name-prefix "/ecs/domus"
aws logs tail /ecs/domus/agent --follow
```

### 构建日志
构建过程中的所有输出都会显示在终端中，包括：
- 代码检出信息
- Docker构建进度
- 镜像推送状态
- ECS部署状态
