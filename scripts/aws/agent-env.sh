#!/bin/bash

# Domus Agent Environment Configuration
# Source this file to set environment variables for deployment

# AWS Configuration
export AWS_REGION="us-east-1"
export AWS_ACCOUNT_ID="194160272412"

# ECS Configuration
export CLUSTER_NAME="domus-cluster"
export SERVICE_NAME="domus-agent"
export TASK_FAMILY="domus-agent"

# ECR Configuration
export ECR_REPO="194160272412.dkr.ecr.us-east-1.amazonaws.com/domus-agent"
export IMAGE_TAG="latest"

# Network Configuration (from existing infrastructure)
export VPC_ID="vpc-065087f3624f558d3"
export SUBNETS="subnet-0374260798a029c6b,subnet-0972c3b87623da21a"
export SECURITY_GROUP="sg-00bfa42ff2c477486"

# Service Discovery Configuration
export SERVICE_DISCOVERY_NAMESPACE_ID="ns-6t65cxkaq7n5qzgf"
export SERVICE_DISCOVERY_SERVICE_ID="srv-wlqzbrkc4tuneisr"
export SERVICE_DISCOVERY_ARN="arn:aws:servicediscovery:us-east-1:194160272412:service/srv-wlqzbrkc4tuneisr"

# IAM Roles (from existing infrastructure)
export EXECUTION_ROLE_ARN="arn:aws:iam::194160272412:role/domus-ecs-execution-role"
export TASK_ROLE_ARN="arn:aws:iam::194160272412:role/domus-ecs-task-role"

# Service Configuration
export DESIRED_COUNT="1"
export MIN_COUNT="1"
export MAX_COUNT="2"
export CONTAINER_PORT="8082"

# Secrets Manager Configuration
export SECRETS_PREFIX="arn:aws:secretsmanager:us-east-1:194160272412:secret:domus/dev/config"

# Redis Configuration (from existing infrastructure)
export REDIS_URL="redis://domus-redis.9zxv3l.ng.0001.use1.cache.amazonaws.com:6379"

# CloudWatch Logs
export LOG_GROUP="/ecs/domus"
export LOG_STREAM_PREFIX="agent"

# Environment Variables
export ENVIRONMENT="dev"
export LOG_LEVEL="info"

echo "✅ Environment variables loaded for domus-agent deployment"
echo "🏗️  Cluster: $CLUSTER_NAME"
echo "🐳 Image: $ECR_REPO:$IMAGE_TAG"
echo "🌐 VPC: $VPC_ID"
echo "🔍 Service Discovery: agent.domus.local"
