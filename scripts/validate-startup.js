#!/usr/bin/env node

/**
 * Carbon系统启动验证脚本
 * 验证前后端服务状态和关键功能
 */

const http = require('http');
const https = require('https');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// HTTP请求工具函数
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', reject);
  });
}

// 测试项目
const tests = [
  {
    name: '前端应用健康检查',
    url: 'http://localhost:3000',
    check: (response) => response.status === 200,
    description: 'React前端应用应该正常响应'
  },
  {
    name: 'API健康检查',
    url: 'http://localhost:3001/api/v1/health',
    check: (response) => response.status === 200,
    description: 'NestJS API健康检查端点应该返回200'
  },
  {
    name: 'API文档访问',
    url: 'http://localhost:3001/api/docs',
    check: (response) => response.status === 200 && response.data.includes('swagger'),
    description: 'Swagger API文档应该可以访问'
  },
  {
    name: '计算器类型接口',
    url: 'http://localhost:3001/api/v1/calculations/activity-types',
    check: (response) => response.status === 401, // 需要认证，401是预期的
    description: '计算器接口应该要求认证'
  }
];

// 验证函数
async function runValidation() {
  log('\n🚀 Carbon碳排放计算系统启动验证', colors.blue);
  log('=' .repeat(50), colors.blue);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      log(`\n🔍 ${test.name}...`, colors.yellow);
      const response = await makeRequest(test.url);
      
      if (test.check(response)) {
        log(`✅ PASS: ${test.description}`, colors.green);
        passed++;
      } else {
        log(`❌ FAIL: ${test.description}`, colors.red);
        log(`   Status: ${response.status}`, colors.red);
        failed++;
      }
    } catch (error) {
      log(`❌ ERROR: ${test.name} - ${error.message}`, colors.red);
      failed++;
    }
  }
  
  // 总结
  log('\n' + '='.repeat(50), colors.blue);
  log(`📊 验证结果: ${passed}个通过, ${failed}个失败`, colors.blue);
  
  if (failed === 0) {
    log('\n🎉 所有检查通过！系统已准备就绪。', colors.green);
    log('\n📱 访问地址:', colors.blue);
    log('  • 前端应用: http://localhost:3000', colors.green);
    log('  • API文档:  http://localhost:3001/api/docs', colors.green);
    log('  • API端点:  http://localhost:3001/api/v1', colors.green);
    
    log('\n👥 演示账号:', colors.blue);
    log('  • 管理员: admin@caict-carbon.com / admin123', colors.green);
    log('  • 经理:   manager@caict-carbon.com / manager123', colors.green);
    log('  • 成员:   member@caict-carbon.com / member123', colors.green);
    
    log('\n🎯 推荐体验流程:', colors.blue);
    log('  1. 访问前端应用并登录', colors.yellow);
    log('  2. 浏览仪表板和统计数据', colors.yellow);
    log('  3. 添加活动数据记录', colors.yellow);
    log('  4. 进行碳排放计算', colors.yellow);
    log('  5. 查看分析报表', colors.yellow);
    
    return true;
  } else {
    log('\n⚠️  部分检查失败，请检查服务状态。', colors.yellow);
    return false;
  }
}

// 运行验证
if (require.main === module) {
  runValidation().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runValidation };