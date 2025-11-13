#!/bin/bash

# Setup auto scaling for domus-agent service

set -e

REGION="us-east-1"
SERVICE_NAME="domus-agent"
CLUSTER_NAME="domus-cluster"

echo "🔧 Setting up auto scaling for $SERVICE_NAME..."

# Register scalable target
aws application-autoscaling register-scalable-target \
    --region $REGION \
    --cli-input-json file://$(dirname "$0")/auto-scaling.json

echo "✅ Scalable target registered"

# Create scaling policy
aws application-autoscaling put-scaling-policy \
    --region $REGION \
    --cli-input-json file://$(dirname "$0")/scaling-policy.json

echo "✅ CPU-based scaling policy created"
echo "📊 Service will scale from 1 to 2 instances based on 70% CPU utilization"
