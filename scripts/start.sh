#!/bin/bash

# 企业碳计量数字化平台启动脚本

set -e

echo "🚀 启动企业碳计量数字化平台..."

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
        echo "   后端 API: http://localhost:3001"
        echo "   前端应用: http://localhost:3000"
        echo "   API 文档: http://localhost:3001/api/docs"
        ;;
        
    "prod")
        echo "🚀 启动生产环境..."
        docker-compose -f infra/docker/docker-compose.yml up -d
        
        echo "⏳ 等待服务启动..."
        sleep 30
        
        echo "✅ 生产环境启动完成！"
        echo ""
        echo "📝 服务访问地址："
        echo "   前端应用: http://localhost:80"
        echo "   后端 API: http://localhost:80/api"
        echo "   API 文档: http://localhost:80/api/docs"
        ;;
        
    *)
        echo "使用方法: ./start.sh [dev|prod]"
        exit 1
        ;;
esac

echo ""
echo "💡 提示："
echo "   - 查看日志: docker-compose logs -f"
echo "   - 停止服务: docker-compose down"
echo "   - 重启服务: docker-compose restart"