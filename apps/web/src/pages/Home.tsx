import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                碳排放计算系统
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link 
                to="/login" 
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                登录
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                企业级碳排放计算平台
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-green-100">
                遵循 GHG Protocol 标准，支持 Scope 1/2/3 全范围碳核算，助力企业实现碳中和目标
              </p>
              <div className="mt-10">
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-colors"
                >
                  开始使用
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                核心功能
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                全面的碳排放计算和管理解决方案
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="bg-green-100 rounded-lg p-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  智能计算引擎
                </h3>
                <p className="mt-2 text-gray-600">
                  支持电力、燃料、交通、废弃物等多种排放源的精确计算
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="bg-green-100 rounded-lg p-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  多租户管理
                </h3>
                <p className="mt-2 text-gray-600">
                  支持多组织、多项目管理，灵活的权限控制体系
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="bg-green-100 rounded-lg p-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  数据分析报表
                </h3>
                <p className="mt-2 text-gray-600">
                  可视化图表展示，多维度统计分析，支持数据导出
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-green-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">15+</div>
                <div className="mt-2 text-green-100">支持的计算器类型</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">7</div>
                <div className="mt-2 text-green-100">内置排放因子数据库</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="mt-2 text-green-100">GHG Protocol 合规</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 碳排放计算系统. 保留所有权利.</p>
            <p className="mt-2 text-sm">
              遵循 MIT 开源协议 | 基于 GHG Protocol 标准构建
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};