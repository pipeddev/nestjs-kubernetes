import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/requests/create-user.dto';
import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { User } from 'src/users/model/entities/user.entity';
import { UserDto } from '../dtos/responses/users.dto';
import { BusinessError } from 'src/common/errors/business-error';
import { TraceLogger } from 'src/common/logger/trace.logger';

@Injectable()
export class CreateUserUC {
  private readonly logger = new TraceLogger(CreateUserUC.name);
  constructor(private readonly repository: UsersRepository) {}

  async execute(createUserDto: CreateUserDto): Promise<UserDto> {
    this.logger.log(`Creating user with email: ${createUserDto.toString()}`);
    const existingUser = await this.repository.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new BusinessError({
        message: 'Email already in use',
        status: HttpStatus.BAD_REQUEST,
        code: 'EMAIL_IN_USE',
        details: { email: createUserDto.email },
      });
    }
    const user = this.ofUser(createUserDto);
    const userCreated = await this.repository.save(user);
    this.logger.log(`User created with ID: ${userCreated.id}`);
    return UserDto.valueOf(userCreated);
  }

  private ofUser(createUserDto: CreateUserDto): User {
    const user = new User();
    user.name = createUserDto.name;
    user.email = createUserDto.email;
    return user;
  }
}
