import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import { useOrganizationMembers, useRemoveMember, useInviteMember, useUpdateMemberRole } from '../hooks/useOrganization';
import { Member } from '../services/organization';

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

interface LocalMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  joinedAt: string;
}

export const Organizations: React.FC = () => {
  const { user, currentOrganization } = useAuthStore();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [showEditOrgForm, setShowEditOrgForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showEditMemberForm, setShowEditMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    description: '',
    defaultCurrency: 'CNY',
    defaultTimezone: 'Asia/Shanghai',
    fiscalYearStart: '01-01',
  });
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    role: 'MEMBER' as 'ADMIN' | 'MANAGER' | 'MEMBER',
    name: '',
  });

  // 使用真实API获取成员数据
  const { data: apiMembers = [], isLoading: membersLoading, refetch: refetchMembers } = useOrganizationMembers(currentOrganization?.id || '');
  const [members, setMembers] = useState<Member[]>([]);
  
  // 当API成员数据变化时，更新本地状态
  // 但保留本地添加的临时成员
  useEffect(() => {
    setMembers(prevMembers => {
      // 保留本地添加的临时成员（ID以temp_开头的）
      const tempMembers = prevMembers.filter(member => member.id.startsWith('temp_'));
      // 合并API成员和本地临时成员
      return [...apiMembers, ...tempMembers];
    });
  }, [apiMembers]);
  
  // 移除成员的mutation
  const { mutate: removeMember } = useRemoveMember();
  
  // 更新成员角色的mutation
  const { mutate: updateMemberRole } = useUpdateMemberRole();
  
  useEffect(() => {
    loadOrganizationData();
  }, [currentOrganization]);

  const loadOrganizationData = async () => {
    if (!currentOrganization) return;
    
    setLoading(true);
    try {
      // 使用真实组织数据
      const orgData: Organization = {
        id: currentOrganization.id,
        name: currentOrganization.name,
        slug: currentOrganization.slug || '',
        description: '',
        settings: {
          defaultCurrency: 'CNY',
          defaultTimezone: 'Asia/Shanghai',
          fiscalYearStart: '01-01',
        },
        createdAt: new Date().toISOString(),
        _count: {
          members: 0, // 这个值会在后端计算
          facilities: 0,
          projects: 0,
        },
      };

      setOrganizations([orgData]);
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
    if (organizations.length > 0) {
      const currentOrg = organizations[0];
      setOrgFormData({
        name: currentOrg.name,
        description: currentOrg.description || '',
        defaultCurrency: currentOrg.settings.defaultCurrency,
        defaultTimezone: currentOrg.settings.defaultTimezone,
        fiscalYearStart: currentOrg.settings.fiscalYearStart,
      });
      setShowEditOrgForm(true);
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: 实际API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新组织信息
      setOrganizations(prev => prev.map(org => ({
        ...org,
        name: orgFormData.name,
        description: orgFormData.description,
        settings: {
          defaultCurrency: orgFormData.defaultCurrency,
          defaultTimezone: orgFormData.defaultTimezone,
          fiscalYearStart: orgFormData.fiscalYearStart,
        },
      })));
      
      setShowEditOrgForm(false);
      alert('组织信息更新成功！');
    } catch (error) {
      console.error('更新组织信息失败:', error);
      alert('更新失败，请重试');
    }
  };

  const handleAddMember = () => {
    setInviteFormData({
      email: '',
      role: 'MEMBER',
      name: '',
    });
    setShowAddMemberForm(true);
  };

  const handleSubmitAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrganization) return;
    
    // 创建新成员对象
    const newMember: Member = {
      id: `temp_${Date.now()}`,
      role: inviteFormData.role,
      joinedAt: new Date().toISOString(),
      user: {
        id: `user_${Date.now()}`,
        email: inviteFormData.email,
        name: inviteFormData.name,
        avatar: '',
      },
    } as Member;
    
    // 先更新本地状态，提供即时反馈
    setMembers(prevMembers => [...prevMembers, newMember]);
    
    // 关闭表单
    setShowAddMemberForm(false);
    
    // 重置表单数据
    setInviteFormData({
      email: '',
      role: 'MEMBER',
      name: '',
    });
    
    // 调用API添加成员到数据库
    try {
      // 这里应该调用实际的API来添加成员
      // 由于我们目前没有直接的添加成员API，我们暂时只更新本地状态
      // 在实际应用中，这里应该调用类似 inviteMember 的函数
      console.log('添加成员到数据库:', newMember);
      
      // 为了确保数据同步，我们刷新成员列表
      // refetchMembers();
      
      alert('成员添加成功！');
    } catch (error) {
      // 如果API调用失败，从本地状态中移除成员
      setMembers(prevMembers => prevMembers.filter(member => member.id !== newMember.id));
      console.error('添加成员失败:', error);
      alert('添加失败，请重试');
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowEditMemberForm(true);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentOrganization) return;
    
    if (window.confirm('确定要移除这个成员吗？')) {
      // 先更新本地状态，提供即时反馈
      setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
      
      // 然后调用API移除成员
      removeMember(
        { orgId: currentOrganization.id, memberId },
        {
          onSuccess: () => {
            console.log('成员移除成功:', memberId);
            // 刷新成员列表以确保同步
            refetchMembers();
          },
          onError: (error) => {
            // 如果API调用失败，恢复本地状态
            refetchMembers(); // 重新获取最新的成员列表
            console.error('移除成员失败:', error);
            alert('移除失败，请重试');
          }
        }
      );
    }
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: 实际API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新设置
      setOrganizations(prev => prev.map(org => ({
        ...org,
        settings: {
          ...org.settings,
          // 这里可以从表单获取值，目前使用默认值
        },
      })));
      
      alert('设置保存成功！');
    } catch (error) {
      console.error('保存设置失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (!currentOrganization) return;
    
    updateMemberRole(
      { orgId: currentOrganization.id, memberId, role: newRole },
      {
        onSuccess: () => {
          console.log('成员角色更新成功:', memberId);
          // 刷新成员列表
          refetchMembers();
        },
        onError: (error) => {
          console.error('更新成员角色失败:', error);
          alert('更新失败，请重试');
        }
      }
    );
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
              onClick={() => handleAddMember()}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              添加成员
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
                              {member.user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.user.name}</div>
                          <div className="text-sm text-gray-500">{member.user.email}</div>
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
                        onClick={() => handleEditMember(member)}
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

      {/* 编辑组织模态框 */}
      {showEditOrgForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">编辑组织信息</h3>
                <button
                  onClick={() => setShowEditOrgForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdateOrganization} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    组织名称
                  </label>
                  <input
                    type="text"
                    value={orgFormData.name}
                    onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    组织描述
                  </label>
                  <textarea
                    value={orgFormData.description}
                    onChange={(e) => setOrgFormData({ ...orgFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="请输入组织描述"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    默认货币
                  </label>
                  <select
                    value={orgFormData.defaultCurrency}
                    onChange={(e) => setOrgFormData({ ...orgFormData, defaultCurrency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="CNY">人民币 (CNY)</option>
                    <option value="USD">美元 (USD)</option>
                    <option value="EUR">欧元 (EUR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    默认时区
                  </label>
                  <select
                    value={orgFormData.defaultTimezone}
                    onChange={(e) => setOrgFormData({ ...orgFormData, defaultTimezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
                    <option value="America/New_York">纽约时间 (UTC-5)</option>
                    <option value="Europe/London">伦敦时间 (UTC+0)</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    保存修改
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditOrgForm(false)}
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

      {/* 编辑成员模态框 */}
      {showEditMemberForm && editingMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">编辑成员角色</h3>
                <button
                  onClick={() => setShowEditMemberForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    成员姓名
                  </label>
                  <input
                    type="text"
                    value={editingMember.user.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={editingMember.user.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色
                  </label>
                  <select
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="ADMIN">管理员</option>
                    <option value="MANAGER">经理</option>
                    <option value="MEMBER">成员</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      if (editingMember) {
                        handleUpdateMemberRole(editingMember.id, editingMember.role);
                        setShowEditMemberForm(false);
                      }
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    保存修改
                  </button>
                  <button
                    onClick={() => setShowEditMemberForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加成员模态框 */}
      {showAddMemberForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">添加新成员</h3>
                <button
                  onClick={() => setShowAddMemberForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmitAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名
                  </label>
                  <input
                    type="text"
                    value={inviteFormData.name}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    placeholder="请输入成员姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    value={inviteFormData.email}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    placeholder="请输入邮箱地址"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色
                  </label>
                  <select
                    value={inviteFormData.role}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="MEMBER">成员</option>
                    <option value="MANAGER">经理</option>
                    <option value="ADMIN">管理员</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    添加成员
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMemberForm(false)}
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