# Domus-Agent 服务部署指南

## 架构位置
Domus-Agent 是domus系统第三大核心服务，与gateway、service并行：
- **Gateway**: 8080 (统一入口)
- **Service**: 8081 (业务服务)  
- **Agent**: 8082 (代理服务)

## 服务发现配置
- **DNS**: `agent.domus.local:8082`
- **命名空间**: `domus.local`
- **服务注册**: AWS Cloud Map

## 当前项目集成
已在domus_go项目中配置路由：
- `/api/v1/*` → service.domus.local:8081
- `/api/v1/agent/*` → agent.domus.local:8082

## 部署步骤
1. 使用domus_go项目中的AWS CLI脚本模式
2. 遵循现有gateway/service的部署模式
3. 服务发现自动注册到`agent.domus.local:8082`

## 本地开发
- 端口: 8082
- 地址: localhost:8082