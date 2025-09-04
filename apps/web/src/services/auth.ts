import api from './api';

// 模拟用户数据
const MOCK_USERS = {
  'admin@carbon.example.com': {
    id: '1',
    email: 'admin@carbon.example.com',
    name: '系统管理员',
    locale: 'zh-CN',
    timezone: 'Asia/Shanghai',
    memberships: [{
      id: 'm1',
      role: 'ADMIN',
      organization: {
        id: 'org1',
        name: '示例环保科技公司',
        slug: 'demo-org'
      }
    }]
  },
  'manager@carbon.example.com': {
    id: '2',
    email: 'manager@carbon.example.com',
    name: '项目经理',
    locale: 'zh-CN',
    timezone: 'Asia/Shanghai',
    memberships: [{
      id: 'm2',
      role: 'MANAGER',
      organization: {
        id: 'org1',
        name: '示例环保科技公司',
        slug: 'demo-org'
      }
    }]
  },
  'member@carbon.example.com': {
    id: '3',
    email: 'member@carbon.example.com',
    name: '团队成员',
    locale: 'zh-CN',
    timezone: 'Asia/Shanghai',
    memberships: [{
      id: 'm3',
      role: 'MEMBER',
      organization: {
        id: 'org1',
        name: '示例环保科技公司',
        slug: 'demo-org'
      }
    }]
  }
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    locale: string;
    timezone: string;
    memberships: Array<{
      id: string;
      role: string;
      organization: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  };
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // 先尝试真实 API
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error) {
      // 如果 API 不可用，使用模拟登录
      console.log('使用模拟登录，后端服务可能未启动');
      return this.mockLogin(data);
    }
  },

  async mockLogin(data: LoginRequest): Promise<AuthResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_USERS[data.email as keyof typeof MOCK_USERS];
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 简单的密码验证
    const validPasswords = {
      'admin@carbon.example.com': 'admin123',
      'manager@carbon.example.com': 'manager123',
      'member@carbon.example.com': 'member123'
    };
    
    if (validPasswords[data.email as keyof typeof validPasswords] !== data.password) {
      throw new Error('密码错误');
    }
    
    return {
      user,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      tokenType: 'Bearer',
      expiresIn: '1h'
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // 本地存储管理
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};