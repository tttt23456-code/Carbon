import api from './api';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  country?: string;
  region?: string;
  timezone: string;
  role: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
  country?: string;
  region?: string;
  timezone?: string;
  settings?: Record<string, any>;
}

export interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export const organizationService = {
  async getAll(): Promise<Organization[]> {
    const response = await api.get('/organizations');
    return response.data;
  },

  async getById(id: string): Promise<Organization> {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },

  async create(data: CreateOrganizationRequest): Promise<Organization> {
    const response = await api.post('/organizations', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateOrganizationRequest>): Promise<Organization> {
    const response = await api.patch(`/organizations/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/organizations/${id}`);
  },

  async getMembers(id: string): Promise<Member[]> {
    const response = await api.get(`/organizations/${id}/members`);
    return response.data;
  },

  async inviteMember(id: string, email: string, role: string): Promise<Member> {
    const response = await api.post(`/organizations/${id}/members`, { email, role });
    return response.data;
  },

  async updateMemberRole(orgId: string, memberId: string, role: string): Promise<Member> {
    const response = await api.patch(`/organizations/${orgId}/members/${memberId}`, { role });
    return response.data;
  },

  async removeMember(orgId: string, memberId: string): Promise<void> {
    await api.delete(`/organizations/${orgId}/members/${memberId}`);
  },
};