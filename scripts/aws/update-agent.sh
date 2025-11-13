#!/bin/bash

# Quick update script for domus-agent service
# Usage: ./update-agent.sh [IMAGE_TAG]

set -e

# Load environment variables
source "$(dirname "$0")/agent-env.sh"

# Override image tag if provided
if [ ! -z "$1" ]; then
    export IMAGE_TAG="$1"
fi

echo "🚀 Updating domus-agent service with image: $ECR_REPO:$IMAGE_TAG"

# Update the task definition with new image tag
sed "s|\"image\": \".*\"|\"image\": \"$ECR_REPO:$IMAGE_TAG\"|" \
    "$(dirname "$0")/domus-agent-task-definition.json" > /tmp/domus-agent-task-def-temp.json

# Register new task definition
TASK_DEF_ARN=$(aws ecs register-task-definition \
    --region $AWS_REGION \
    --cli-input-json file:///tmp/domus-agent-task-def-temp.json \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)

echo "✅ New task definition registered: $TASK_DEF_ARN"

# Update service
aws ecs update-service \
    --region $AWS_REGION \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --task-definition $TASK_DEF_ARN \
    > /dev/null

echo "✅ Service update initiated"

# Wait for deployment
echo "⏳ Waiting for deployment to complete..."
aws ecs wait services-stable \
    --region $AWS_REGION \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME

echo "🎉 domus-agent updated successfully!"

# Clean up temp file
rm -f /tmp/domus-agent-task-def-temp.json
