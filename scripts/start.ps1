# 碳排放计算系统启动脚本 (PowerShell)

param(
    [Parameter(Position=0)]
    [string]$Mode = "dev"
)

Write-Host "🚀 启动碳排放计算系统..." -ForegroundColor Green

# 检查 Docker 是否安装
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker 未安装，请先安装 Docker" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose 未安装，请先安装 Docker Compose" -ForegroundColor Red
    exit 1
}

# 检查环境变量文件
if (-not (Test-Path .env)) {
    Write-Host "📝 创建环境变量文件..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  请编辑 .env 文件并设置正确的环境变量" -ForegroundColor Yellow
}

switch ($Mode) {
    "dev" {
        Write-Host "🔧 启动开发环境..." -ForegroundColor Cyan
        docker-compose -f infra/docker/docker-compose.dev.yml up -d
        
        Write-Host "⏳ 等待数据库启动..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "📊 运行数据库迁移..." -ForegroundColor Cyan
        Set-Location apps/api
        npx prisma migrate deploy
        
        Write-Host "🌱 添加种子数据..." -ForegroundColor Cyan
        npx prisma db seed
        
        Set-Location ../..
        
        Write-Host "✅ 开发环境启动完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 服务访问地址：" -ForegroundColor White
        Write-Host "   数据库: postgresql://carbon_user:carbon_password@localhost:5432/carbon_db" -ForegroundColor Gray
        Write-Host "   Redis: redis://localhost:6379" -ForegroundColor Gray
        Write-Host "   pgAdmin: http://localhost:5050 (admin@carbon.dev / admin123)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🚀 启动开发服务器：" -ForegroundColor White
        Write-Host "   后端: cd apps/api && pnpm dev" -ForegroundColor Gray
        Write-Host "   前端: cd apps/web && pnpm dev" -ForegroundColor Gray
    }
    
    "prod" {
        Write-Host "🚀 启动生产环境..." -ForegroundColor Cyan
        docker-compose -f infra/docker/docker-compose.yml up -d
        
        Write-Host "⏳ 等待服务启动..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host "✅ 生产环境启动完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 服务访问地址：" -ForegroundColor White
        Write-Host "   前端: http://localhost:3000" -ForegroundColor Gray
        Write-Host "   后端 API: http://localhost:3001" -ForegroundColor Gray
        Write-Host "   API 文档: http://localhost:3001/api/docs" -ForegroundColor Gray
        Write-Host "   pgAdmin: http://localhost:5050 (admin@carbon.local / admin123)" -ForegroundColor Gray
    }
    
    "stop" {
        Write-Host "🛑 停止服务..." -ForegroundColor Yellow
        docker-compose -f infra/docker/docker-compose.yml down
        docker-compose -f infra/docker/docker-compose.dev.yml down
        Write-Host "✅ 服务已停止" -ForegroundColor Green
    }
    
    "clean" {
        Write-Host "🧹 清理 Docker 资源..." -ForegroundColor Yellow
        docker-compose -f infra/docker/docker-compose.yml down -v
        docker-compose -f infra/docker/docker-compose.dev.yml down -v
        docker system prune -f
        Write-Host "✅ 清理完成" -ForegroundColor Green
    }
    
    default {
        Write-Host "Usage: .\scripts\start.ps1 {dev|prod|stop|clean}" -ForegroundColor White
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor White
        Write-Host "  dev   - 启动开发环境（仅数据库等基础服务）" -ForegroundColor Gray
        Write-Host "  prod  - 启动生产环境（完整系统）" -ForegroundColor Gray
        Write-Host "  stop  - 停止所有服务" -ForegroundColor Gray
        Write-Host "  clean - 清理所有 Docker 资源" -ForegroundColor Gray
        exit 1
    }
}