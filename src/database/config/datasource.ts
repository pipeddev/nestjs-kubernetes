import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { Environment } from 'src/environment';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: Environment.DB_HOST,
  port: Environment.DB_PORT,
  username: Environment.DB_USERNAME,
  password: Environment.DB_PASSWORD,
  database: Environment.DB_DATABASE,
  schema: Environment.DB_SCHEMA,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/scripts/*.js'],
  migrationsRun: true,
  ssl: Environment.DB_SSL ? { rejectUnauthorized: false } : false,
  extra: {
    //options: `-c search_path=${Environment.DB_SCHEMA},public`, // No funciona en algunos casos como NEON
    min: Environment.DB_POOL_MIN,
    max: Environment.DB_POOL_MAX,
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
