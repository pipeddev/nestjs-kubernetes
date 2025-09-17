import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersResolver } from './resolvers/users.resolver';
import { UsersRepository } from './model/repositories/users.repository';
import { SelectUsersUseCase } from './services/use-cases/select-users.uc';
import { User } from './model/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FindUserUC } from './services/use-cases/find-user.uc';
import { CreateUserUC } from './services/use-cases/create-user.uc';
import { UpdateUserUC } from './services/use-cases/update-user.uc';
import { DeleteUserUC } from './services/use-cases/delete-user.uc';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersResolver,
    SelectUsersUseCase,
    FindUserUC,
    CreateUserUC,
    UpdateUserUC,
    DeleteUserUC,
    UsersRepository,
  ],
})
export class UsersModule {}
