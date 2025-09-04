// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  defaultCurrency: string;
  defaultTimezone: string;
  fiscalYearStart: string;
}

export interface ActivityRecord {
  id: string;
  organizationId: string;
  facilityId?: string;
  projectId?: string;
  activityType: string;
  description?: string;
  amount: number;
  unit: string;
  metadata: Record<string, any>;
  dataQuality: 'measured' | 'calculated' | 'estimated';
  recordedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalculationResult {
  id: string;
  activityRecordId: string;
  emissionFactorId: string;
  tCO2e: number;
  breakdown: Record<string, number>;
  method: string;
  dataQuality: string;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmissionFactor {
  id: string;
  organizationId?: string;
  activityType: string;
  region: string;
  year: number;
  factorValue: number;
  factorUnit: string;
  source: string;
  reference?: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityType = 
  | 'electricity'
  | 'natural_gas'
  | 'diesel'
  | 'gasoline'
  | 'flight_domestic'
  | 'flight_international'
  | 'road_freight'
  | 'waste_landfill'
  | 'waste_incineration';

export type DataQuality = 'measured' | 'calculated' | 'estimated';

export type EmissionScope = 1 | 2 | 3;

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

export interface CalculationRequest {
  activityType: string;
  amount: number;
  unit: string;
  metadata?: Record<string, any>;
  factorId?: string;
}

export interface CalculationResponse {
  id: string;
  tCO2e: number;
  breakdown: Record<string, number>;
  method: string;
  dataQuality: string;
  calculatedAt: string;
}
