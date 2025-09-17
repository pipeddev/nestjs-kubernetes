import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../dtos/requests/update-user.dto';
import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { User } from 'src/users/model/entities/user.entity';
import { UserDto } from '../dtos/responses/users.dto';

@Injectable()
export class UpdateUserUC {
  constructor(private readonly repository: UsersRepository) {}
  async execute(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    let user = await this.repository.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user = this.ofUser(user, updateUserDto);
    await this.repository.save(user);

    return UserDto.valueOf(user);
  }

  private ofUser(user: User, updateUserDto: UpdateUserDto): User {
    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    return user;
  }
}
