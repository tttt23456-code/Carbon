import api from './api';

export interface CalculationInput {
  activityType: string;
  amount: number;
  unit: string;
  metadata?: Record<string, any>;
}

export interface CalculationResult {
  tCO2e: number;
  breakdown: {
    originalAmount: number;
    originalUnit: string;
    normalizedAmount: number;
    normalizedUnit: string;
    emissionFactor: number;
    emissionFactorUnit: string;
    gwp: number;
    co2Amount: number;
    methodology: string;
    assumptions: Record<string, any>;
  };
  method: string;
  dataQuality: string;
  uncertainty?: number;
}

export interface BatchCalculationRequest {
  activityRecordIds?: string[];
  filters?: {
    scope?: string[];
    category?: string[];
    activityType?: string[];
    projectId?: string;
    facilityId?: string;
    periodStart?: string;
    periodEnd?: string;
  };
}

export interface BatchCalculationResult {
  totalEmissions: number;
  calculationCount: number;
  results: Array<{
    activityRecordId: string;
    result: CalculationResult;
    factorUsed: any;
  }>;
  summary: {
    byScope: Record<string, number>;
    byCategory: Record<string, number>;
    byActivityType: Record<string, number>;
  };
}

export interface SupportedActivityTypes {
  activityTypes: string[];
  groups: Record<string, string[]>;
}

export const calculationService = {
  async calculate(data: CalculationInput & { factorId?: string }): Promise<CalculationResult> {
    const response = await api.post('/calculations/calculate', data);
    return response.data;
  },

  async batchCalculate(data: BatchCalculationRequest): Promise<BatchCalculationResult> {
    const response = await api.post('/calculations/batch', data);
    return response.data;
  },

  async recalculate(activityRecordId: string, factorId?: string): Promise<CalculationResult> {
    const response = await api.patch(`/calculations/recalculate/${activityRecordId}`, { factorId });
    return response.data;
  },

  async getSupportedActivityTypes(): Promise<SupportedActivityTypes> {
    const response = await api.get('/calculations/activity-types');
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/calculations/statistics');
    return response.data;
  },

  async validateCalculators() {
    const response = await api.get('/calculations/validate');
    return response.data;
  },
};