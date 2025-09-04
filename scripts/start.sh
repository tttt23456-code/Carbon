#!/bin/bash

# 碳排放计算系统启动脚本

set -e

echo "🚀 启动碳排放计算系统..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件并设置正确的环境变量"
fi

# 启动模式
MODE=${1:-dev}

case $MODE in
    "dev")
        echo "🔧 启动开发环境..."
        docker-compose -f infra/docker/docker-compose.dev.yml up -d
        
        echo "⏳ 等待数据库启动..."
        sleep 10
        
        echo "📊 运行数据库迁移..."
        cd apps/api
        npx prisma migrate deploy
        
        echo "🌱 添加种子数据..."
        npx prisma db seed
        
        cd ../..
        
        echo "✅ 开发环境启动完成！"
        echo ""
        echo "📝 服务访问地址："
        echo "   数据库: postgresql://carbon_user:carbon_password@localhost:5432/carbon_db"
        echo "   Redis: redis://localhost:6379"
        echo "   pgAdmin: http://localhost:5050 (admin@carbon.dev / admin123)"
        echo ""
        echo "🚀 启动开发服务器："
        echo "   后端: cd apps/api && pnpm dev"
        echo "   前端: cd apps/web && pnpm dev"
        ;;
        
    "prod")
        echo "🚀 启动生产环境..."
        docker-compose -f infra/docker/docker-compose.yml up -d
        
        echo "⏳ 等待服务启动..."
        sleep 30
        
        echo "✅ 生产环境启动完成！"
        echo ""
        echo "🌐 服务访问地址："
        echo "   前端: http://localhost:3000"
        echo "   后端 API: http://localhost:3001"
        echo "   API 文档: http://localhost:3001/api/docs"
        echo "   pgAdmin: http://localhost:5050 (admin@carbon.local / admin123)"
        ;;
        
    "stop")
        echo "🛑 停止服务..."
        docker-compose -f infra/docker/docker-compose.yml down
        docker-compose -f infra/docker/docker-compose.dev.yml down
        echo "✅ 服务已停止"
        ;;
        
    "clean")
        echo "🧹 清理 Docker 资源..."
        docker-compose -f infra/docker/docker-compose.yml down -v
        docker-compose -f infra/docker/docker-compose.dev.yml down -v
        docker system prune -f
        echo "✅ 清理完成"
        ;;
        
    *)
        echo "Usage: $0 {dev|prod|stop|clean}"
        echo ""
        echo "Commands:"
        echo "  dev   - 启动开发环境（仅数据库等基础服务）"
        echo "  prod  - 启动生产环境（完整系统）"
        echo "  stop  - 停止所有服务"
        echo "  clean - 清理所有 Docker 资源"
        exit 1
        ;;
esac