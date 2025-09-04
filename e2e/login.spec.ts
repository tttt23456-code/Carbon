import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page elements', async ({ page }) => {
    await page.click('text=登录');
    await expect(page.locator('h2')).toContainText('登录到您的账户');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('登录');
  });

  test('should show validation error for empty form', async ({ page }) => {
    await page.click('text=登录');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=请输入邮箱和密码')).toBeVisible();
  });

  test('should login with demo admin account', async ({ page }) => {
    await page.click('text=登录');
    
    // 点击管理员演示账号
    await page.click('text=管理员账号');
    
    // 等待登录完成并跳转到仪表板
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1')).toContainText('仪表板');
  });

  test('should navigate through main sections after login', async ({ page }) => {
    // 登录
    await page.click('text=登录');
    await page.click('text=管理员账号');
    await page.waitForURL('/dashboard');

    // 测试导航到活动数据页面
    await page.click('text=活动数据');
    await page.waitForURL('/dashboard/activity-records');
    await expect(page.locator('h1')).toContainText('活动数据管理');

    // 测试导航到计算页面
    await page.click('text=碳排放计算');
    await page.waitForURL('/dashboard/calculations');
    await expect(page.locator('h1')).toContainText('碳排放计算');

    // 测试导航到报表页面
    await page.click('text=报表分析');
    await page.waitForURL('/dashboard/reports');
    await expect(page.locator('h1')).toContainText('报表分析');

    // 测试导航到组织管理页面
    await page.click('text=组织管理');
    await page.waitForURL('/dashboard/organizations');
    await expect(page.locator('h1')).toContainText('组织管理');
  });

  test('should logout successfully', async ({ page }) => {
    // 登录
    await page.click('text=登录');
    await page.click('text=管理员账号');
    await page.waitForURL('/dashboard');

    // 登出
    await page.click('text=登出');
    await page.waitForURL('/login');
    await expect(page.locator('h2')).toContainText('登录到您的账户');
  });
});