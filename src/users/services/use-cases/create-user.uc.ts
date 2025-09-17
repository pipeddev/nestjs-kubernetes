import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/requests/create-user.dto';
import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { User } from 'src/users/model/entities/user.entity';
import { UserDto } from '../dtos/responses/users.dto';

@Injectable()
export class CreateUserUC {
  constructor(private readonly repository: UsersRepository) {}
  // Aquí puedes inyectar repositorios u otros servicios necesarios
  async execute(createUserDto: CreateUserDto): Promise<UserDto> {
    // Lógica para crear un usuario
    const user = this.ofUser(createUserDto);
    const userCreated = await this.repository.save(user);
    return UserDto.valueOf(userCreated);
  }

  private ofUser(createUserDto: CreateUserDto): User {
    const user = new User();
    user.name = createUserDto.name;
    user.email = createUserDto.email;
    return user;
  }
}
