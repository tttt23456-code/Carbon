# 企业碳计量数字化平台启动脚本

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod")]
    [string]$Mode = "dev"
)

Write-Host "🚀 启动企业碳计量数字化平台..." -ForegroundColor Green

# 检查 Docker 是否安装
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker 未安装，请先安装 Docker" -ForegroundColor Red
    exit 1
}

# 检查 Docker Compose 是否安装
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose 未安装，请先安装 Docker Compose" -ForegroundColor Red
    exit 1
}

# 检查环境变量文件
if (!(Test-Path ".env")) {
    Write-Host "📝 创建环境变量文件..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  请编辑 .env 文件并设置正确的环境变量" -ForegroundColor Yellow
}

switch ($Mode) {
    "dev" {
        Write-Host "🔧 启动开发环境..." -ForegroundColor Blue
        docker-compose -f infra/docker/docker-compose.dev.yml up -d
        
        Write-Host "⏳ 等待数据库启动..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "📊 运行数据库迁移..." -ForegroundColor Blue
        Set-Location apps/api
        npx prisma migrate deploy
        
        Write-Host "🌱 添加种子数据..." -ForegroundColor Blue
        npx prisma db seed
        
        Set-Location ../..
        
        Write-Host "✅ 开发环境启动完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 服务访问地址：" -ForegroundColor Cyan
        Write-Host "   数据库: postgresql://carbon_user:carbon_password@localhost:5432/carbon_db"
        Write-Host "   Redis: redis://localhost:6379"
        Write-Host "   后端 API: http://localhost:3001"
        Write-Host "   前端应用: http://localhost:3000"
        Write-Host "   API 文档: http://localhost:3001/api/docs"
    }
    
    "prod" {
        Write-Host "🚀 启动生产环境..." -ForegroundColor Blue
        docker-compose -f infra/docker/docker-compose.yml up -d
        
        Write-Host "⏳ 等待服务启动..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host "✅ 生产环境启动完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 服务访问地址：" -ForegroundColor Cyan
        Write-Host "   前端应用: http://localhost:80"
        Write-Host "   后端 API: http://localhost:80/api"
        Write-Host "   API 文档: http://localhost:80/api/docs"
    }
}

Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Magenta
Write-Host "   - 查看日志: docker-compose logs -f"
Write-Host "   - 停止服务: docker-compose down"
Write-Host "   - 重启服务: docker-compose restart"