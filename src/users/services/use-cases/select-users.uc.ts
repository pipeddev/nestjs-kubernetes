import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { UsersDto } from '../dtos/responses/users.dto';

@Injectable()
export class SelectUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(): Promise<UsersDto> {
    const users = await this.usersRepository.findAll();
    return UsersDto.valueOf(users);
  }
}
