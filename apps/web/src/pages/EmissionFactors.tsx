import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import { emissionFactorService, EmissionFactor as ServiceEmissionFactor, CreateEmissionFactorDto, UpdateEmissionFactorDto } from '../services/emission-factor';

interface LocalEmissionFactor extends ServiceEmissionFactor {
  createdAt: string;
}

export const EmissionFactors: React.FC = () => {
  const { currentOrganization } = useAuthStore();
  const [factors, setFactors] = useState<LocalEmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFactor, setEditingFactor] = useState<LocalEmissionFactor | null>(null);
  const [formData, setFormData] = useState<Partial<LocalEmissionFactor>>({
    source: '',
    sourceType: 'CUSTOM',
    region: '',
    year: new Date().getFullYear(),
    activityType: '',
    description: '',
    unit: '',
    factorValue: 0,
    factorUnit: 'kg CO2e/unit',
    gas: 'CO2',
    gwp: 1,
    isActive: true,
    isDefault: false,
    priority: 0,
  });

  useEffect(() => {
    loadEmissionFactors();
  }, [currentOrganization]);

  const loadEmissionFactors = async () => {
    setLoading(true);
    try {
      const response = await emissionFactorService.findAll();
      setFactors(response.data);
    } catch (error) {
      console.error('加载排放因子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createData: CreateEmissionFactorDto = {
        source: formData.source || '',
        sourceType: formData.sourceType || 'CUSTOM',
        region: formData.region || '',
        year: formData.year || new Date().getFullYear(),
        activityType: formData.activityType || '',
        description: formData.description || '',
        unit: formData.unit || '',
        factorValue: formData.factorValue || 0,
        factorUnit: formData.factorUnit || 'kg CO2e/unit',
        gas: formData.gas || 'CO2',
        gwp: formData.gwp || 1,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        isDefault: formData.isDefault !== undefined ? formData.isDefault : false,
        priority: formData.priority || 0,
      };
      
      const newFactor = await emissionFactorService.create(createData);
      setFactors([newFactor, ...factors]);
      setShowCreateForm(false);
      setFormData({
        source: '',
        sourceType: 'CUSTOM',
        region: '',
        year: new Date().getFullYear(),
        activityType: '',
        description: '',
        unit: '',
        factorValue: 0,
        factorUnit: 'kg CO2e/unit',
        gas: 'CO2',
        gwp: 1,
        isActive: true,
        isDefault: false,
        priority: 0,
      });
    } catch (error) {
      console.error('创建排放因子失败:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFactor) return;
    
    try {
      const updateData: UpdateEmissionFactorDto = {};
      
      // 只更新有变化的字段
      if (formData.source !== undefined && formData.source !== editingFactor.source) {
        updateData.source = formData.source;
      }
      if (formData.sourceType !== undefined && formData.sourceType !== editingFactor.sourceType) {
        updateData.sourceType = formData.sourceType;
      }
      if (formData.region !== undefined && formData.region !== editingFactor.region) {
        updateData.region = formData.region;
      }
      if (formData.year !== undefined && formData.year !== editingFactor.year) {
        updateData.year = formData.year;
      }
      if (formData.activityType !== undefined && formData.activityType !== editingFactor.activityType) {
        updateData.activityType = formData.activityType;
      }
      if (formData.description !== undefined && formData.description !== editingFactor.description) {
        updateData.description = formData.description;
      }
      if (formData.unit !== undefined && formData.unit !== editingFactor.unit) {
        updateData.unit = formData.unit;
      }
      if (formData.factorValue !== undefined && formData.factorValue !== editingFactor.factorValue) {
        updateData.factorValue = formData.factorValue;
      }
      if (formData.factorUnit !== undefined && formData.factorUnit !== editingFactor.factorUnit) {
        updateData.factorUnit = formData.factorUnit;
      }
      if (formData.gas !== undefined && formData.gas !== editingFactor.gas) {
        updateData.gas = formData.gas;
      }
      if (formData.gwp !== undefined && formData.gwp !== editingFactor.gwp) {
        updateData.gwp = formData.gwp;
      }
      if (formData.isActive !== undefined && formData.isActive !== editingFactor.isActive) {
        updateData.isActive = formData.isActive;
      }
      if (formData.isDefault !== undefined && formData.isDefault !== editingFactor.isDefault) {
        updateData.isDefault = formData.isDefault;
      }
      if (formData.priority !== undefined && formData.priority !== editingFactor.priority) {
        updateData.priority = formData.priority;
      }
      
      const updatedFactor = await emissionFactorService.update(editingFactor.id, updateData);
      setFactors(factors.map(f => f.id === editingFactor.id ? updatedFactor : f));
      setEditingFactor(null);
      setFormData({
        source: '',
        sourceType: 'CUSTOM',
        region: '',
        year: new Date().getFullYear(),
        activityType: '',
        description: '',
        unit: '',
        factorValue: 0,
        factorUnit: 'kg CO2e/unit',
        gas: 'CO2',
        gwp: 1,
        isActive: true,
        isDefault: false,
        priority: 0,
      });
    } catch (error) {
      console.error('更新排放因子失败:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个排放因子吗？')) return;
    
    try {
      await emissionFactorService.remove(id);
      setFactors(factors.filter(f => f.id !== id));
    } catch (error) {
      console.error('删除排放因子失败:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN');
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
          <h1 className="text-2xl font-bold text-gray-900">排放因子管理</h1>
          <p className="mt-1 text-gray-600">管理系统内置和自定义的排放因子</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          添加因子
        </button>
      </div>

      {/* 创建表单模态框 */}
      {(showCreateForm || editingFactor) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingFactor ? '编辑排放因子' : '创建排放因子'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingFactor(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={editingFactor ? handleUpdate : handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    来源 *
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    来源类型 *
                  </label>
                  <select
                    value={formData.sourceType}
                    onChange={(e) => setFormData({ ...formData, sourceType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="STANDARD">标准</option>
                    <option value="CUSTOM">自定义</option>
                    <option value="ORGANIZATION">组织</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      地区 *
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      年份 *
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活动类型 *
                  </label>
                  <input
                    type="text"
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述 *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      活动单位 *
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      排放因子值 *
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.factorValue}
                      onChange={(e) => setFormData({ ...formData, factorValue: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      因子单位 *
                    </label>
                    <input
                      type="text"
                      value={formData.factorUnit}
                      onChange={(e) => setFormData({ ...formData, factorUnit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      温室气体类型
                    </label>
                    <select
                      value={formData.gas}
                      onChange={(e) => setFormData({ ...formData, gas: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="CO2">CO2</option>
                      <option value="CH4">CH4</option>
                      <option value="N2O">N2O</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GWP值
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.gwp}
                      onChange={(e) => setFormData({ ...formData, gwp: parseFloat(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      优先级
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">激活</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">默认</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {editingFactor ? '更新因子' : '创建因子'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingFactor(null);
                    }}
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

      {/* 排放因子列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">排放因子列表</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  来源/描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  地区/年份
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  活动类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排放因子
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
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
              {factors.map((factor) => (
                <tr key={factor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{factor.source}</div>
                    <div className="text-sm text-gray-500">{factor.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{factor.region}</div>
                    <div className="text-sm text-gray-500">{factor.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {factor.activityType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {factor.factorValue} {factor.factorUnit}
                    </div>
                    <div className="text-sm text-gray-500">
                      {factor.gas} (GWP: {factor.gwp})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      factor.isActive 
                        ? factor.isDefault 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {factor.isActive ? (factor.isDefault ? '默认' : '激活') : '停用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(factor.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingFactor(factor);
                        setFormData(factor);
                      }}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(factor.id)}
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
    </div>
  );
};