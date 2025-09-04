import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings: {
    defaultCurrency: string;
    defaultTimezone: string;
    fiscalYearStart: string;
  };
  createdAt: string;
  _count: {
    members: number;
    facilities: number;
    projects: number;
  };
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  joinedAt: string;
}

export const Organizations: React.FC = () => {
  const { user, currentOrganization } = useAuthStore();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');

  useEffect(() => {
    loadOrganizationData();
  }, [currentOrganization]);

  const loadOrganizationData = async () => {
    if (!currentOrganization) return;
    
    setLoading(true);
    try {
      // 模拟数据
      const mockOrg: Organization = {
        id: currentOrganization.id,
        name: currentOrganization.name,
        slug: currentOrganization.slug || 'caict-carbon',
        description: '专注于汽车产业碳排放管理的数字技术中心',
        settings: {
          defaultCurrency: 'CNY',
          defaultTimezone: 'Asia/Shanghai',
          fiscalYearStart: '01-01',
        },
        createdAt: '2024-01-01T00:00:00Z',
        _count: {
          members: 15,
          facilities: 5,
          projects: 8,
        },
      };

      const mockMembers: Member[] = [
        {
          id: '1',
          name: '张三',
          email: 'zhangsan@caict-carbon.com',
          role: 'ADMIN',
          joinedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: '李四',
          email: 'lisi@caict-carbon.com',
          role: 'MANAGER',
          joinedAt: '2024-02-15T00:00:00Z',
        },
        {
          id: '3',
          name: '王五',
          email: 'wangwu@caict-carbon.com',
          role: 'MEMBER',
          joinedAt: '2024-03-10T00:00:00Z',
        },
      ];

      setOrganizations([mockOrg]);
      setMembers(mockMembers);
    } catch (error) {
      console.error('加载组织数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string): string => {
    const labels = {
      ADMIN: '管理员',
      MANAGER: '经理',
      MEMBER: '成员',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string): string => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      MANAGER: 'bg-yellow-100 text-yellow-800',
      MEMBER: 'bg-green-100 text-green-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleEditOrganization = () => {
    // TODO: 实现编辑组织功能
    console.log('编辑组织');
    alert('编辑组织成功！');
  };

  const handleInviteMember = () => {
    // TODO: 实现邀请成员功能
    console.log('邀请成员');
    alert('邀请成员成功！');
  };

  const handleEditMember = (memberId: string) => {
    // TODO: 实现编辑成员功能
    console.log('编辑成员:', memberId);
    alert('编辑成员成功！');
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('确定要移除这个成员吗？')) {
      try {
        // TODO: 实际API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 从列表中移除成员
        setMembers(members.filter(member => member.id !== memberId));
        console.log('移除成员:', memberId);
      } catch (error) {
        console.error('移除成员失败:', error);
        alert('移除失败，请重试');
      }
    }
  };

  const handleSaveSettings = () => {
    // TODO: 实现保存设置功能
    console.log('保存设置');
    alert('设置保存成功！');
  };

  const handleCancelSettings = () => {
    // TODO: 实现取消设置功能
    console.log('取消设置');
    // 可以重置表单数据到原始状态
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const currentOrg = organizations[0];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">组织管理</h1>
        <p className="mt-1 text-gray-600">管理组织设置、成员和权限</p>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '概览' },
            { key: 'members', label: '成员管理' },
            { key: 'settings', label: '设置' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 概览 */}
      {activeTab === 'overview' && currentOrg && (
        <div className="space-y-6">
          {/* 组织信息卡片 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">{currentOrg.name}</h2>
                  <p className="text-gray-600">{currentOrg.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    创建于 {new Date(currentOrg.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleEditOrganization()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                编辑组织
              </button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">成员数量</p>
                  <p className="text-2xl font-semibold text-gray-900">{currentOrg._count.members}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">设施数量</p>
                  <p className="text-2xl font-semibold text-gray-900">{currentOrg._count.facilities}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">项目数量</p>
                  <p className="text-2xl font-semibold text-gray-900">{currentOrg._count.projects}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成员管理 */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">组织成员</h2>
            <button 
              onClick={() => handleInviteMember()}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              邀请成员
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    成员
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    加入时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                        {getRoleLabel(member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.joinedAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditMember(member.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        编辑
                      </button>
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        移除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 设置 */}
      {activeTab === 'settings' && currentOrg && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">组织设置</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  默认货币
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="CNY">人民币 (CNY)</option>
                  <option value="USD">美元 (USD)</option>
                  <option value="EUR">欧元 (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  时区
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
                  <option value="America/New_York">纽约时间 (UTC-5)</option>
                  <option value="Europe/London">伦敦时间 (UTC+0)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                财年开始
              </label>
              <input
                type="text"
                value={currentOrg.settings.fiscalYearStart}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="MM-DD"
              />
            </div>
            <div className="pt-4 border-t border-gray-200">
              <button 
                onClick={() => handleSaveSettings()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-3"
              >
                保存设置
              </button>
              <button 
                onClick={() => handleCancelSettings()}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};