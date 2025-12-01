import { test, expect } from '@playwright/test';

test.describe('Carbon Measurement Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/');
    await page.click('text=登录');
    await page.click('text=管理员账号');
    await page.waitForURL('/dashboard');
  });

  test('should perform single calculation', async ({ page }) => {
    // 导航到计量页面
    await page.click('text=碳排放计量');
    await page.waitForURL('/dashboard/calculations');

    // 选择活动类型
    await page.selectOption('select', 'electricity');
    await page.fill('input[type="number"]', '1000');

    // 设置计算方法
    await page.selectOption('select:has-text("请选择")', 'location_based');

    // 点击计算按钮
    await page.click('button:has-text("开始计算")');

    // 等待计量结果
    await expect(page.locator('text=计量完成')).toBeVisible();
    await expect(page.locator('text=tCO₂e')).toBeVisible();
  });

  test('should add activity record and calculate', async ({ page }) => {
    // 导航到活动数据页面
    await page.click('text=活动数据');
    await page.waitForURL('/dashboard/activity-records');

    // 点击添加活动记录
    await page.click('text=添加活动记录');

    // 填写表单
    await page.selectOption('select', 'electricity');
    await page.fill('input[placeholder="请输入活动描述"]', '测试用电记录');
    await page.fill('input[type="number"]', '500');
    await page.selectOption('select:has-text("实测")', 'measured');

    // 提交表单
    await page.click('button:has-text("添加记录")');

    // 验证记录已添加
    await expect(page.locator('text=测试用电记录')).toBeVisible();
  });

  test('should view reports and statistics', async ({ page }) => {
    // 导航到报表页面
    await page.click('text=报表分析');
    await page.waitForURL('/dashboard/reports');

    // 验证统计卡片
    await expect(page.locator('text=总排放量')).toBeVisible();
    await expect(page.locator('text=Scope 1')).toBeVisible();
    await expect(page.locator('text=Scope 2')).toBeVisible();
    await expect(page.locator('text=Scope 3')).toBeVisible();

    // 验证图表区域
    await expect(page.locator('text=排放趋势')).toBeVisible();
    await expect(page.locator('text=Scope 分布')).toBeVisible();

    // 测试导出功能
    await page.click('text=导出报表');
    // 注意：这里只测试按钮点击，实际文件下载需要更复杂的测试
  });

  test('should manage organization settings', async ({ page }) => {
    // 导航到组织管理页面
    await page.click('text=组织管理');
    await page.waitForURL('/dashboard/organizations');

    // 切换到设置标签页
    await page.click('text=设置');

    // 验证设置表单
    await expect(page.locator('select:has-text("人民币")')).toBeVisible();
    await expect(page.locator('select:has-text("北京时间")')).toBeVisible();

    // 测试保存设置
    await page.click('button:has-text("保存设置")');
  });
});