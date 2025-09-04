import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../../pages/Login';
import { authService } from '../../services/auth';

// Mock authService
jest.mock('../../services/auth');
const mockAuthService = authService as jest.Mocked<typeof authService>;

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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Login />, { wrapper: createWrapper() });
    
    expect(screen.getByText('登录到您的账户')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('邮箱地址')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('shows error message for empty fields', async () => {
    render(<Login />, { wrapper: createWrapper() });
    
    const loginButton = screen.getByRole('button', { name: '登录' });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('请输入邮箱和密码')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockAuthService.login.mockResolvedValue({
      user: {
        id: '1',
        email: 'test@caict-carbon.com',
        name: '测试用户',
        locale: 'zh-CN',
        timezone: 'Asia/Shanghai',
        memberships: [],
      },
      accessToken: 'token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: '1h',
    });

    render(<Login />, { wrapper: createWrapper() });
    
    const emailInput = screen.getByPlaceholderText('邮箱地址');
    const passwordInput = screen.getByPlaceholderText('密码');
    const loginButton = screen.getByRole('button', { name: '登录' });
    
    fireEvent.change(emailInput, { target: { value: 'test@caict-carbon.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@caict-carbon.com',
        password: 'password123',
      });
    });
  });

  it('shows demo accounts', () => {
    render(<Login />, { wrapper: createWrapper() });
    
    expect(screen.getByText('演示账号')).toBeInTheDocument();
    expect(screen.getByText('管理员账号')).toBeInTheDocument();
    expect(screen.getByText('经理账号')).toBeInTheDocument();
    expect(screen.getByText('成员账号')).toBeInTheDocument();
  });

  it('handles quick login for demo account', async () => {
    mockAuthService.login.mockResolvedValue({
      user: {
        id: '1',
        email: 'admin@caict-carbon.com',
        name: '系统管理员',
        locale: 'zh-CN',
        timezone: 'Asia/Shanghai',
        memberships: [],
      },
      accessToken: 'token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: '1h',
    });

    render(<Login />, { wrapper: createWrapper() });
    
    const adminButton = screen.getByText('管理员账号').closest('button');
    fireEvent.click(adminButton!);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'admin@caict-carbon.com',
        password: 'admin123',
      });
    });
  });
});