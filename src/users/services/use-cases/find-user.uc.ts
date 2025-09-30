import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { UserDto } from '../dtos/responses/users.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindUserUC {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<UserDto | null> {
    const user = await this.usersRepository.findById(id);

    return UserDto.valueOf(user);
  }
}
