import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../../pages/Dashboard';
import { useAuthStore } from '../../hooks/useAuthStore';

// Mock useAuthStore
jest.mock('../../hooks/useAuthStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: '测试用户',
        locale: 'zh-CN',
        timezone: 'Asia/Shanghai',
        memberships: [],
      },
      currentOrganization: {
        id: 'org1',
        name: '测试组织',
        slug: 'test-org',
      },
      isAuthenticated: true,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
      setCurrentOrganization: jest.fn(),
    });
  });

  it('renders dashboard title', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('仪表板')).toBeInTheDocument();
    });
  });

  it('displays organization name', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('测试组织 的碳排放概览')).toBeInTheDocument();
    });
  });

  it('shows statistics cards', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('总活动记录')).toBeInTheDocument();
      expect(screen.getByText('总排放量')).toBeInTheDocument();
      expect(screen.getByText('本月排放')).toBeInTheDocument();
      expect(screen.getByText('待处理计算')).toBeInTheDocument();
    });
  });

  it('displays quick action buttons', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('添加活动数据')).toBeInTheDocument();
      expect(screen.getByText('开始计算')).toBeInTheDocument();
      expect(screen.getByText('查看报表')).toBeInTheDocument();
      expect(screen.getByText('组织设置')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});