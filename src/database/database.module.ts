import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Environment } from 'src/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
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
      autoLoadEntities: false,
      synchronize: false,
      logging: false,
      ...(Environment.DB_SSL ? { ssl: { rejectUnauthorized: false } } : {}),
    }),
  ],
})
export class DatabaseModule {}
