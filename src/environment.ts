import 'dotenv/config';

export const Environment = {
  PORT: process.env.PORT ?? 3000,
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: +(process.env.DB_PORT ?? 5432),
  DB_USERNAME: process.env.DB_USERNAME ?? 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD ?? 'postgres',
  DB_DATABASE: process.env.DB_DATABASE ?? 'postgres',
  DB_SCHEMA: process.env.DB_SCHEMA ?? 'public',
  DB_SSL: process.env.DB_SSL === 'true' || process.env.DB_SSLMODE === 'require',
  DB_POOL_MIN: +(process.env.DB_POOL_MIN ?? 2),
  DB_POOL_MAX: +(process.env.DB_POOL_MAX ?? 10),
};
