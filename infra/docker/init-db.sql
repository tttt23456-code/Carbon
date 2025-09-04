-- 初始化数据库脚本
-- 此脚本在 PostgreSQL 容器首次启动时执行

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建索引（如果需要的话，这些通常由 Prisma 迁移处理）
-- 这里可以添加一些数据库级别的配置

-- 设置时区
SET timezone = 'UTC';

-- 插入一些基础配置数据（如果需要的话）
-- 注意：实际的表结构和数据由 Prisma 管理