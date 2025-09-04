import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';

interface CalculationForm {
  activityType: string;
  amount: number;
  unit: string;
  metadata: Record<string, any>;
}

interface CalculationResult {
  id: string;
  activityType: string;
  amount: number;
  unit: string;
  tCO2e: number;
  method: string;
  dataQuality: string;
  breakdown?: Record<string, number>;
  calculatedAt: string;
}

interface EmissionFactor {
  id: string;
  activityType: string;
  factorValue: number;
  factorUnit: string;
  region: string;
  year: number;
  source: string;
}

export const Calculations: React.FC = () => {
  const { currentOrganization } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'results'>('single');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CalculationForm>({
    activityType: '',
    amount: 0,
    unit: '',
    metadata: {},
  });
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [recentResults, setRecentResults] = useState<CalculationResult[]>([]);
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);

  const activityTypes = [
    {
      value: 'electricity',
      label: '电力消耗',
      scope: 2,
      unit: 'kWh',
      metadataFields: [
        { key: 'method', label: '计算方法', type: 'select', options: [
          { value: 'location_based', label: '地点法' },
          { value: 'market_based', label: '市场法' }
        ]},
        { key: 'region', label: '地区', type: 'text' },
      ]
    },
    {
      value: 'natural_gas',
      label: '天然气',
      scope: 1,
      unit: 'm³',
      metadataFields: [
        { key: 'heating_value', label: '热值 (MJ/m³)', type: 'number' },
        { key: 'carbon_content', label: '碳含量 (kg C/GJ)', type: 'number' },
      ]
    },
    {
      value: 'flight_domestic',
      label: '国内航班',
      scope: 3,
      unit: 'km',
      metadataFields: [
        { key: 'cabin_class', label: '舱位等级', type: 'select', options: [
          { value: 'economy', label: '经济舱' },
          { value: 'business', label: '商务舱' },
          { value: 'first', label: '头等舱' }
        ]},
        { key: 'passengers', label: '乘客数量', type: 'number' },
      ]
    },
    {
      value: 'road_freight',
      label: '公路货运',
      scope: 3,
      unit: 'tonne-km',
      metadataFields: [
        { key: 'vehicle_type', label: '车辆类型', type: 'select', options: [
          { value: 'truck_small', label: '小型货车' },
          { value: 'truck_medium', label: '中型货车' },
          { value: 'truck_large', label: '大型货车' }
        ]},
        { key: 'fuel_type', label: '燃料类型', type: 'select', options: [
          { value: 'diesel', label: '柴油' },
          { value: 'gasoline', label: '汽油' }
        ]},
      ]
    },
  ];

  useEffect(() => {
    loadEmissionFactors();
    loadRecentResults();
  }, [currentOrganization]);

  const loadEmissionFactors = async () => {
    try {
      // TODO: 实际API调用
      const mockFactors: EmissionFactor[] = [
        {
          id: '1',
          activityType: 'electricity',
          factorValue: 0.5810,
          factorUnit: 'kg CO2e/kWh',
          region: 'CN',
          year: 2023,
          source: 'CHINA_GRID'
        },
        {
          id: '2',
          activityType: 'natural_gas',
          factorValue: 2.034,
          factorUnit: 'kg CO2e/m³',
          region: 'CN',
          year: 2023,
          source: 'IPCC'
        },
      ];
      setEmissionFactors(mockFactors);
    } catch (error) {
      console.error('加载排放因子失败:', error);
    }
  };

  const loadRecentResults = async () => {
    try {
      // TODO: 实际API调用
      const mockResults: CalculationResult[] = [
        {
          id: '1',
          activityType: 'electricity',
          amount: 1200,
          unit: 'kWh',
          tCO2e: 0.697,
          method: 'location_based',
          dataQuality: 'calculated',
          calculatedAt: '2024-09-04T10:30:00Z',
        },
        {
          id: '2',
          activityType: 'natural_gas',
          amount: 850,
          unit: 'm³',
          tCO2e: 1.729,
          method: 'direct_combustion',
          dataQuality: 'calculated',
          calculatedAt: '2024-09-04T09:15:00Z',
        },
      ];
      setRecentResults(mockResults);
    } catch (error) {
      console.error('加载计算结果失败:', error);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: 实际API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟计算结果
      const factor = emissionFactors.find(f => f.activityType === formData.activityType);
      const emissions = factor ? (formData.amount * factor.factorValue / 1000) : 0;
      
      const result: CalculationResult = {
        id: Date.now().toString(),
        activityType: formData.activityType,
        amount: formData.amount,
        unit: formData.unit,
        tCO2e: emissions,
        method: formData.metadata.method || 'default',
        dataQuality: 'calculated',
        breakdown: {
          'CO2': emissions * 0.95,
          'CH4': emissions * 0.03,
          'N2O': emissions * 0.02,
        },
        calculatedAt: new Date().toISOString(),
      };
      
      setCalculationResult(result);
      setRecentResults([result, ...recentResults]);
    } catch (error) {
      console.error('计算失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeInfo = (type: string) => {
    return activityTypes.find(t => t.value === type);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(num);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">碳排放计算</h1>
        <p className="mt-1 text-gray-600">计算各类活动的温室气体排放量</p>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('single')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'single'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            单次计算
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'batch'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            批量计算
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'results'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            计算结果
          </button>
        </nav>
      </div>

      {/* 单次计算 */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 计算表单 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">计算参数</h2>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动类型
                </label>
                <select
                  value={formData.activityType}
                  onChange={(e) => {
                    const selectedType = getActivityTypeInfo(e.target.value);
                    setFormData({
                      ...formData,
                      activityType: e.target.value,
                      unit: selectedType?.unit || '',
                      metadata: {},
                    });
                    setCalculationResult(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">请选择活动类型</option>
                  {activityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} (Scope {type.scope})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    数量
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    单位
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    readOnly={!!getActivityTypeInfo(formData.activityType)}
                  />
                </div>
              </div>

              {/* 动态元数据字段 */}
              {formData.activityType && getActivityTypeInfo(formData.activityType)?.metadataFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={formData.metadata[field.key] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, [field.key]: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">请选择</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      step="any"
                      value={formData.metadata[field.key] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, [field.key]: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.metadata[field.key] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, [field.key]: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={loading || !formData.activityType || !formData.amount}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    计算中...
                  </span>
                ) : (
                  '开始计算'
                )}
              </button>
            </form>
          </div>

          {/* 计算结果 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">计算结果</h2>
            {calculationResult ? (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-green-800">计算完成</h3>
                      <div className="mt-2 text-3xl font-bold text-green-900">
                        {formatNumber(calculationResult.tCO2e)} tCO₂e
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <dt className="text-sm font-medium text-gray-500">活动类型</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {getActivityTypeInfo(calculationResult.activityType)?.label}
                    </dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <dt className="text-sm font-medium text-gray-500">计算方法</dt>
                    <dd className="mt-1 text-sm text-gray-900">{calculationResult.method}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <dt className="text-sm font-medium text-gray-500">活动数据</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatNumber(calculationResult.amount)} {calculationResult.unit}
                    </dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <dt className="text-sm font-medium text-gray-500">计算时间</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(calculationResult.calculatedAt)}
                    </dd>
                  </div>
                </div>

                {calculationResult.breakdown && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">排放分解</h4>
                    <div className="space-y-2">
                      {Object.entries(calculationResult.breakdown).map(([gas, value]) => (
                        <div key={gas} className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600">{gas}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatNumber(value)} tCO₂e
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="mt-2 text-sm text-gray-500">填写计算参数后开始计算</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 批量计算 */}
      {activeTab === 'batch' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">批量计算</h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">批量计算功能</h3>
            <p className="mt-2 text-gray-500">
              上传CSV或Excel文件进行批量计算
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                上传文件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 计算结果历史 */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">计算结果历史</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    活动类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    活动数据
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    排放量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    计算方法
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    计算时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getActivityTypeInfo(result.activityType)?.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatNumber(result.amount)} {result.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatNumber(result.tCO2e)} tCO₂e
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(result.calculatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        查看详情
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};