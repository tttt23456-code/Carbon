import * as jwt from 'jsonwebtoken';

// 使用与后端相同的密钥
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// 创建一个测试令牌
const payload = {
  sub: 'cmigt1p6e00005nm2tiwi0acc', // 用户ID
  email: 'admin@caict-carbon.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15分钟后过期
};

const token = jwt.sign(payload, JWT_SECRET);
console.log('Generated token:', token);

// 验证令牌
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Decoded token:', decoded);
} catch (error) {
  console.error('Token verification failed:', error);
}