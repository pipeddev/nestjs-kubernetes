import { BusinessError } from 'src/common/errors/business-error';
import { HttpStatus } from '@nestjs/common';
import { CreateUserUC } from 'src/users/services/use-cases/create-user.uc';
import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { CreateUserDto } from 'src/users/services/dtos/requests/create-user.dto';
import { User } from 'src/users/model/entities/user.entity';
import { UserDto } from 'src/users/services/dtos/responses/users.dto';

jest.mock('src/common/logger/trace.logger', () => ({
  TraceLogger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
  })),
}));

describe('CreateUserUC', () => {
  let createUserUC: CreateUserUC;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    repository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    createUserUC = new CreateUserUC(repository);
  });

  const createUserDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('should create a user when email is not in use', async () => {
    repository.findByEmail.mockResolvedValue(null);

    const user = new User();
    user.id = '123';
    user.name = createUserDto.name;
    user.email = createUserDto.email;

    repository.save.mockResolvedValue(user);

    const userDto = { id: user.id, name: user.name, email: user.email };
    jest.spyOn(UserDto, 'valueOf').mockReturnValue(userDto);

    const result = await createUserUC.execute(createUserDto);

    expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: createUserDto.name,
        email: createUserDto.email,
      }),
    );
    expect(result).toEqual(userDto);
  });

  it('should throw BusinessError if email is already in use', async () => {
    const existingUser = new User();
    repository.findByEmail.mockResolvedValue(existingUser);

    await expect(createUserUC.execute(createUserDto)).rejects.toThrow(BusinessError);
    await expect(createUserUC.execute(createUserDto)).rejects.toMatchObject({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringContaining('Email already in use'),
      status: HttpStatus.BAD_REQUEST,
    });
    expect(repository.save).not.toHaveBeenCalled();
  });
});
