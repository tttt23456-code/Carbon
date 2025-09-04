import api from './api';

export interface ActivityRecord {
  id: string;
  activityType: string;
  scope: string;
  category: string;
  amount: number;
  unit: string;
  periodStart: string;
  periodEnd: string;
  description?: string;
  reference?: string;
  dataQuality: string;
  uncertainty?: number;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  project?: {
    id: string;
    name: string;
  };
  facility?: {
    id: string;
    name: string;
    type: string;
  };
  calculationResults?: Array<{
    id: string;
    tCO2e: number;
    method: string;
    calculatedAt: string;
  }>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityRecordRequest {
  activityType: string;
  scope: string;
  category: string;
  amount: number;
  unit: string;
  periodStart: string;
  periodEnd: string;
  projectId?: string;
  facilityId?: string;
  description?: string;
  reference?: string;
  dataQuality?: string;
  uncertainty?: number;
  metadata?: Record<string, any>;
}

export interface ActivityRecordsQuery {
  page?: number;
  limit?: number;
  scope?: string;
  activityType?: string;
  projectId?: string;
  facilityId?: string;
  startDate?: string;
  endDate?: string;
  verifiedOnly?: boolean;
}

export interface ActivityRecordsResponse {
  data: ActivityRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ActivityRecordStatistics {
  total: number;
  verified: number;
  verificationRate: string;
  byScope: Record<string, number>;
  byCategory: Record<string, number>;
  byActivityType: Record<string, number>;
}

export const activityRecordService = {
  async getAll(query?: ActivityRecordsQuery): Promise<ActivityRecordsResponse> {
    const response = await api.get('/activity-records', { params: query });
    return response.data;
  },

  async getById(id: string): Promise<ActivityRecord> {
    const response = await api.get(`/activity-records/${id}`);
    return response.data;
  },

  async create(data: CreateActivityRecordRequest): Promise<ActivityRecord> {
    const response = await api.post('/activity-records', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateActivityRecordRequest>): Promise<ActivityRecord> {
    const response = await api.patch(`/activity-records/${id}`, data);
    return response.data;
  },

  async verify(id: string, isVerified: boolean, notes?: string): Promise<ActivityRecord> {
    const response = await api.patch(`/activity-records/${id}/verify`, { isVerified, notes });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/activity-records/${id}`);
  },

  async getStatistics(startDate?: string, endDate?: string): Promise<ActivityRecordStatistics> {
    const response = await api.get('/activity-records/statistics', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};