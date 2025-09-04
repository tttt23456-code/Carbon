import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';

interface ReportData {
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
  monthlyTrend: Array<{
    month: string;
    emissions: number;
  }>;
  activityBreakdown: Array<{
    type: string;
    label: string;
    emissions: number;
    percentage: number;
  }>;
  facilityBreakdown: Array<{
    name: string;
    emissions: number;
    percentage: number;
  }>;
}

export const Reports: React.FC = () => {
  const { currentOrganization } = useAuthStore();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadReportData();
  }, [currentOrganization, selectedPeriod, selectedYear]);

  const loadReportData = async () => {
    if (!currentOrganization) return;
    
    setLoading(true);
    try {
      // TODO: 实际API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟数据
      const mockData: ReportData = {
        totalEmissions: 2847.5,
        scope1: 1234.2,
        scope2: 876.8,
        scope3: 736.5,
        monthlyTrend: [
          { month: '2024-01', emissions: 245.2 },
          { month: '2024-02', emissions: 267.8 },
          { month: '2024-03', emissions: 298.1 },
          { month: '2024-04', emissions: 234.5 },
          { month: '2024-05', emissions: 256.7 },
          { month: '2024-06', emissions: 289.3 },
          { month: '2024-07', emissions: 276.4 },
          { month: '2024-08', emissions: 312.8 },
          { month: '2024-09', emissions: 234.8 },
        ],
        activityBreakdown: [
          { type: 'electricity', label: '电力消耗', emissions: 876.8, percentage: 30.8 },
          { type: 'natural_gas', label: '天然气', emissions: 698.5, percentage: 24.5 },
          { type: 'diesel', label: '柴油', emissions: 535.7, percentage: 18.8 },
          { type: 'flight', label: '航班', emissions: 456.2, percentage: 16.0 },
          { type: 'road_freight', label: '公路货运', emissions: 280.3, percentage: 9.9 },
        ],
        facilityBreakdown: [
          { name: '总部大楼', emissions: 1234.5, percentage: 43.4 },
          { name: '生产厂房A', emissions: 876.3, percentage: 30.8 },
          { name: '生产厂房B', emissions: 543.2, percentage: 19.1 },
          { name: '仓储中心', emissions: 193.5, percentage: 6.8 },
        ],
      };
      
      setReportData(mockData);
    } catch (error) {
      console.error('加载报表数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num);
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getScopeColor = (scope: number): string => {
    const colors = {
      1: 'bg-red-500',
      2: 'bg-yellow-500',
      3: 'bg-blue-500',
    };
    return colors[scope as keyof typeof colors] || 'bg-gray-500';
  };

  const exportReport = () => {
    // TODO: 实现报表导出功能
    console.log('导出报表');
    
    // 模拟导出功能
    const csvData = [
      '时间,总排放量(tCO₂e),Scope 1,Scope 2,Scope 3',
      `${selectedYear}年,${reportData?.totalEmissions || 0},${reportData?.scope1 || 0},${reportData?.scope2 || 0},${reportData?.scope3 || 0}`,
      ...reportData?.monthlyTrend.map(item => 
        `${item.month},${item.emissions},,,`
      ) || []
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `碳排放报表_${selectedYear}年.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('报表导出成功！');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">暂无报表数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报表分析</h1>
          <p className="mt-1 text-gray-600">查看碳排放趋势和分析报告</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={2024}>2024年</option>
            <option value={2023}>2023年</option>
            <option value={2022}>2022年</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="month">按月</option>
            <option value="quarter">按季度</option>
            <option value="year">按年</option>
          </select>
          <button
            onClick={exportReport}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出报表
          </button>
        </div>
      </div>

      {/* 总览统计 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">总排放量</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(reportData.totalEmissions)} <span className="text-sm text-gray-500">tCO₂e</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scope 1</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(reportData.scope1)} <span className="text-sm text-gray-500">tCO₂e</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scope 2</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(reportData.scope2)} <span className="text-sm text-gray-500">tCO₂e</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scope 3</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(reportData.scope3)} <span className="text-sm text-gray-500">tCO₂e</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 排放趋势图 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">排放趋势</h2>
            <div className="text-sm text-gray-500">
              {selectedYear}年 ({selectedPeriod === 'month' ? '月度' : selectedPeriod === 'quarter' ? '季度' : '年度'})
            </div>
          </div>
          <div className="h-64 flex items-end space-x-2">
            {reportData.monthlyTrend.map((item, index) => {
              const maxEmissions = Math.max(...reportData.monthlyTrend.map(d => d.emissions));
              const height = (item.emissions / maxEmissions) * 100;
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">
                    {formatNumber(item.emissions)}
                  </div>
                  <div
                    className="w-full bg-green-500 rounded-t-sm"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-center">
                    {item.month.slice(-2)}月
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scope 分布饼图 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scope 分布</h2>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              {/* 简化的饼图表示 */}
              <div className="absolute inset-0 rounded-full border-8 border-red-500" 
                   style={{ 
                     background: `conic-gradient(
                       #ef4444 0% ${(reportData.scope1 / reportData.totalEmissions * 100)}%, 
                       #eab308 ${(reportData.scope1 / reportData.totalEmissions * 100)}% ${((reportData.scope1 + reportData.scope2) / reportData.totalEmissions * 100)}%, 
                       #3b82f6 ${((reportData.scope1 + reportData.scope2) / reportData.totalEmissions * 100)}% 100%
                     )` 
                   }}>
              </div>
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(reportData.totalEmissions)}
                  </div>
                  <div className="text-sm text-gray-500">tCO₂e</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Scope 1 - 直接排放</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(reportData.scope1)} tCO₂e ({formatPercentage(reportData.scope1 / reportData.totalEmissions * 100)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Scope 2 - 间接排放</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(reportData.scope2)} tCO₂e ({formatPercentage(reportData.scope2 / reportData.totalEmissions * 100)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Scope 3 - 其他间接排放</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(reportData.scope3)} tCO₂e ({formatPercentage(reportData.scope3 / reportData.totalEmissions * 100)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 详细分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 活动类型分解 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">按活动类型分解</h2>
          <div className="space-y-4">
            {reportData.activityBreakdown.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3" 
                       style={{ opacity: 1 - (index * 0.15) }}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${item.percentage}%`,
                          opacity: 1 - (index * 0.15)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(item.emissions)} tCO₂e
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(item.percentage)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 设施分解 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">按设施分解</h2>
          <div className="space-y-4">
            {reportData.facilityBreakdown.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3" 
                       style={{ opacity: 1 - (index * 0.15) }}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${item.percentage}%`,
                          opacity: 1 - (index * 0.15)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(item.emissions)} tCO₂e
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(item.percentage)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">详细数据</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  月份
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总排放量 (tCO₂e)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope 2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope 3
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  环比变化
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.monthlyTrend.map((item, index) => {
                const prevEmissions = index > 0 ? reportData.monthlyTrend[index - 1].emissions : null;
                const change = prevEmissions ? ((item.emissions - prevEmissions) / prevEmissions * 100) : null;
                
                return (
                  <tr key={item.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.emissions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.emissions * 0.43)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.emissions * 0.31)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.emissions * 0.26)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {change !== null ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          change > 0 
                            ? 'bg-red-100 text-red-800' 
                            : change < 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};