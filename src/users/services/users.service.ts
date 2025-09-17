import { Injectable } from '@nestjs/common';
import { SelectUsersUseCase } from './use-cases/select-users.uc';
import { UserDto, UsersDto } from './dtos/responses/users.dto';
import { FindUserUC } from './use-cases/find-user.uc';
import { CreateUserDto } from './dtos/requests/create-user.dto';
import { CreateUserUC } from './use-cases/create-user.uc';
import { UpdateUserDto } from './dtos/requests/update-user.dto';
import { UpdateUserUC } from './use-cases/update-user.uc';
import { DeleteUserUC } from './use-cases/delete-user.uc';

@Injectable()
export class UsersService {
  constructor(
    private readonly selectUsersUseCase: SelectUsersUseCase,
    private readonly findUserUC: FindUserUC,
    private readonly createUserUC: CreateUserUC,
    private readonly updateUserUC: UpdateUserUC,
    private readonly deleteUserUC: DeleteUserUC,
  ) {}

  async findAll(): Promise<UsersDto> {
    return this.selectUsersUseCase.execute();
  }

  async findOne(id: number): Promise<UserDto | null> {
    return this.findUserUC.execute(id);
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    return this.createUserUC.execute(createUserDto);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    return this.updateUserUC.execute(id, updateUserDto);
  }

  remove(id: number) {
    return this.deleteUserUC.execute(id);
  }

  /*
  async update(id: number, data: Partial<User>) {
    await this.usersRepo.update(id, data);
    return this.findOne(id);
  }

  */
}
