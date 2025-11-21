import api from './api';

export interface EmissionFactor {
  id: string;
  organizationId: string | null;
  source: string;
  sourceType: 'STANDARD' | 'CUSTOM' | 'ORGANIZATION';
  region: string;
  year: number;
  activityType: string;
  description: string;
  unit: string;
  factorValue: number;
  factorUnit: string;
  gas: string;
  gwp: number;
  reference?: string;
  methodology?: string;
  assumptions?: Record<string, any>;
  metadata?: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  priority: number;
  validityStart?: string;
  validityEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmissionFactorDto {
  source: string;
  sourceType: 'STANDARD' | 'CUSTOM' | 'ORGANIZATION';
  region: string;
  year: number;
  activityType: string;
  description: string;
  unit: string;
  factorValue: number;
  factorUnit: string;
  gas: string;
  gwp: number;
  reference?: string;
  methodology?: string;
  assumptions?: Record<string, any>;
  metadata?: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  priority: number;
  validityStart?: string;
  validityEnd?: string;
}

export interface UpdateEmissionFactorDto {
  source?: string;
  sourceType?: 'STANDARD' | 'CUSTOM' | 'ORGANIZATION';
  region?: string;
  year?: number;
  activityType?: string;
  description?: string;
  unit?: string;
  factorValue?: number;
  factorUnit?: string;
  gas?: string;
  gwp?: number;
  reference?: string;
  methodology?: string;
  assumptions?: Record<string, any>;
  metadata?: Record<string, any>;
  isActive?: boolean;
  isDefault?: boolean;
  priority?: number;
  validityStart?: string;
  validityEnd?: string;
}

export interface EmissionFactorQueryDto {
  page?: number;
  limit?: number;
  source?: string;
  sourceType?: 'STANDARD' | 'CUSTOM' | 'ORGANIZATION';
  region?: string;
  year?: number;
  activityType?: string;
  gas?: string;
  activeOnly?: boolean;
  defaultOnly?: boolean;
}

export const emissionFactorService = {
  async findAll(query?: EmissionFactorQueryDto): Promise<{ data: EmissionFactor[]; pagination: any }> {
    const response = await api.get('/emission-factors', { params: query });
    return response.data;
  },

  async findOne(id: string): Promise<EmissionFactor> {
    const response = await api.get(`/emission-factors/${id}`);
    return response.data;
  },

  async create(data: CreateEmissionFactorDto): Promise<EmissionFactor> {
    const response = await api.post('/emission-factors', data);
    return response.data;
  },

  async update(id: string, data: UpdateEmissionFactorDto): Promise<EmissionFactor> {
    const response = await api.patch(`/emission-factors/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/emission-factors/${id}`);
  },

  async getBestFactor(activityType: string, region: string): Promise<EmissionFactor> {
    const response = await api.get(`/emission-factors/best/${activityType}/${region}`);
    return response.data;
  },
};