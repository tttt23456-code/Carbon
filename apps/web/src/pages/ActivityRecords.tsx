import React, { useState, useEffect } from 'react';
import { useActivityRecords } from '../hooks/useActivityRecords';
import { useAuthStore } from '../hooks/useAuthStore';

interface ActivityRecord {
  id: string;
  activityType: string;
  description: string;
  amount: number;
  unit: string;
  dataQuality: 'measured' | 'calculated' | 'estimated';
  scope: 1 | 2 | 3;
  facility?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
  calculationResult?: {
    tCO2e: number;
    calculatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateActivityForm {
  activityType: string;
  description: string;
  amount: number;
  unit: string;
  dataQuality: 'measured' | 'calculated' | 'estimated';
  facilityId?: string;
  projectId?: string;
}

export const ActivityRecords: React.FC = () => {
  const { currentOrganization } = useAuthStore();
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateActivityForm>({
    activityType: '',
    description: '',
    amount: 0,
    unit: '',
    dataQuality: 'measured',
  });

  const activityTypes = [
    { value: 'electricity', label: '电力消耗', scope: 2, unit: 'kWh' },
    { value: 'natural_gas', label: '天然气', scope: 1, unit: 'm³' },
    { value: 'diesel', label: '柴油', scope: 1, unit: 'L' },
    { value: 'gasoline', label: '汽油', scope: 1, unit: 'L' },
    { value: 'flight_domestic', label: '国内航班', scope: 3, unit: 'km' },
    { value: 'flight_international', label: '国际航班', scope: 3, unit: 'km' },
    { value: 'road_freight', label: '公路货运', scope: 3, unit: 'tonne-km' },
    { value: 'waste_landfill', label: '废物填埋', scope: 3, unit: 'kg' },
  ];

  const dataQualityLabels = {
    measured: '实测',
    calculated: '计算',
    estimated: '估算',
  };

  const dataQualityColors = {
    measured: 'bg-green-100 text-green-800',
    calculated: 'bg-yellow-100 text-yellow-800',
    estimated: 'bg-red-100 text-red-800',
  };

  useEffect(() => {
    loadActivityRecords();
  }, [currentOrganization]);

  const loadActivityRecords = async () => {
    if (!currentOrganization) return;
    
    setLoading(true);
    try {
      // TODO: 实际API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟数据
      const mockRecords: ActivityRecord[] = [
        {
          id: '1',
          activityType: 'electricity',
          description: '办公大楼用电量',
          amount: 1200,
          unit: 'kWh',
          dataQuality: 'measured',
          scope: 2,
          facility: { id: 'f1', name: '总部大楼' },
          calculationResult: { tCO2e: 0.697, calculatedAt: '2024-09-04T10:30:00Z' },
          createdAt: '2024-09-04T10:30:00Z',
          updatedAt: '2024-09-04T10:30:00Z',
        },
        {
          id: '2',
          activityType: 'natural_gas',
          description: '工厂天然气消耗',
          amount: 850,
          unit: 'm³',
          dataQuality: 'measured',
          scope: 1,
          facility: { id: 'f2', name: '生产厂房A' },
          calculationResult: { tCO2e: 1.734, calculatedAt: '2024-09-04T09:15:00Z' },
          createdAt: '2024-09-04T09:15:00Z',
          updatedAt: '2024-09-04T09:15:00Z',
        },
        {
          id: '3',
          activityType: 'flight_domestic',
          description: '员工商务出差 - 北京到上海',
          amount: 1200,
          unit: 'km',
          dataQuality: 'calculated',
          scope: 3,
          project: { id: 'p1', name: '市场拓展项目' },
          calculationResult: { tCO2e: 0.144, calculatedAt: '2024-09-03T16:20:00Z' },
          createdAt: '2024-09-03T16:20:00Z',
          updatedAt: '2024-09-03T16:20:00Z',
        },
      ];
      
      setRecords(mockRecords);
    } catch (error) {
      console.error('加载活动记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: 实际API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟添加记录
      const newRecord: ActivityRecord = {
        id: Date.now().toString(),
        ...formData,
        scope: (activityTypes.find(t => t.value === formData.activityType)?.scope || 1) as 1 | 2 | 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setRecords([newRecord, ...records]);
      setShowCreateForm(false);
      setFormData({
        activityType: '',
        description: '',
        amount: 0,
        unit: '',
        dataQuality: 'measured',
      });
    } catch (error) {
      console.error('创建活动记录失败:', error);
    }
  };

  const handleEditRecord = (recordId: string) => {
    // TODO: 实现编辑功能
    console.log('编辑记录:', recordId);
    alert('编辑记录成功！');
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        // TODO: 实际API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 从列表中移除记录
        setRecords(records.filter(record => record.id !== recordId));
        console.log('删除记录:', recordId);
      } catch (error) {
        console.error('删除记录失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const getActivityTypeLabel = (type: string): string => {
    return activityTypes.find(t => t.value === type)?.label || type;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">活动数据管理</h1>
          <p className="mt-1 text-gray-600">记录和管理组织的各类活动数据</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          添加活动记录
        </button>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">总记录数</p>
              <p className="text-2xl font-semibold text-gray-900">{records.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">已计算记录</p>
              <p className="text-2xl font-semibold text-gray-900">
                {records.filter(r => r.calculationResult).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">待计算记录</p>
              <p className="text-2xl font-semibold text-gray-900">
                {records.filter(r => !r.calculationResult).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 记录列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">活动记录</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  活动类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数据质量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排放量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getActivityTypeLabel(record.activityType)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.facility?.name || record.project?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{record.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatNumber(record.amount)} {record.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dataQualityColors[record.dataQuality]}`}>
                      {dataQualityLabels[record.dataQuality]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Scope {record.scope}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.calculationResult ? (
                      <div className="text-sm text-gray-900">
                        {formatNumber(record.calculationResult.tCO2e)} tCO₂e
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">未计算</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(record.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditRecord(record.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 创建表单模态框 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">添加活动记录</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活动类型
                  </label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => {
                      const selectedType = activityTypes.find(t => t.value === e.target.value);
                      setFormData({
                        ...formData,
                        activityType: e.target.value,
                        unit: selectedType?.unit || '',
                      });
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="请输入活动描述"
                    required
                  />
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
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    数据质量
                  </label>
                  <select
                    value={formData.dataQuality}
                    onChange={(e) => setFormData({ ...formData, dataQuality: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="measured">实测</option>
                    <option value="calculated">计算</option>
                    <option value="estimated">估算</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    添加记录
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};