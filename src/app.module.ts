import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/model/entities/user.entity';
import { Environment } from './environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: Environment.DB_URL, // 👈 se usa el connection string
      entities: [User],
      synchronize: true, // solo para pruebas, no en producción
      ssl: {
        rejectUnauthorized: false, // Neon requiere SSL
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true, // aún puedes usar GraphQL Playground
      path: '/graphql',
    }),
    UsersModule,
  ],
})
export class AppModule {}
