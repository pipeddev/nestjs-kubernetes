import { UsersService } from 'src/users/services/users.service';
import { SelectUsersUseCase } from 'src/users/services/use-cases/select-users.uc';
import { FindUserUC } from 'src/users/services/use-cases/find-user.uc';
import { CreateUserUC } from 'src/users/services/use-cases/create-user.uc';
import { UpdateUserUC } from 'src/users/services/use-cases/update-user.uc';
import { DeleteUserUC } from 'src/users/services/use-cases/delete-user.uc';
import { CreateUserDto } from 'src/users/services/dtos/requests/create-user.dto';
import { UpdateUserDto } from 'src/users/services/dtos/requests/update-user.dto';
import { UserDto, UsersDto } from 'src/users/services/dtos/responses/users.dto';

describe('UsersService', () => {
  let service: UsersService;
  let selectUsersUseCase: SelectUsersUseCase;
  let findUserUC: FindUserUC;
  let createUserUC: CreateUserUC;
  let updateUserUC: UpdateUserUC;
  let deleteUserUC: DeleteUserUC;

  beforeEach(() => {
    selectUsersUseCase = { execute: jest.fn() } as unknown as SelectUsersUseCase;
    findUserUC = { execute: jest.fn() } as unknown as FindUserUC;
    createUserUC = { execute: jest.fn() } as unknown as CreateUserUC;
    updateUserUC = { execute: jest.fn() } as unknown as UpdateUserUC;
    deleteUserUC = { execute: jest.fn() } as unknown as DeleteUserUC;

    service = new UsersService(
      selectUsersUseCase,
      findUserUC,
      createUserUC,
      updateUserUC,
      deleteUserUC,
    );
  });

  it('should call selectUsersUseCase.execute on findAll', async () => {
    const usersDto: UsersDto = { users: [] };
    (selectUsersUseCase.execute as jest.Mock).mockResolvedValue(usersDto);

    const result = await service.findAll();

    expect(selectUsersUseCase.execute).toHaveBeenCalled();
    expect(result).toBe(usersDto);
  });

  it('should call findUserUC.execute on findOne', async () => {
    const userDto: UserDto = { id: '1', name: 'Test', email: 'test@test.com' };
    (findUserUC.execute as jest.Mock).mockResolvedValue(userDto);

    const result = await service.findOne('1');

    expect(findUserUC.execute).toHaveBeenCalledWith('1');
    expect(result).toBe(userDto);
  });

  it('should call createUserUC.execute on create', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test',
      email: 'test@test.com',
    };
    const userDto: UserDto = { id: '1', name: 'Test', email: 'test@test.com' };
    (createUserUC.execute as jest.Mock).mockResolvedValue(userDto);

    const result = await service.create(createUserDto);

    expect(createUserUC.execute).toHaveBeenCalledWith(createUserDto);
    expect(result).toBe(userDto);
  });

  it('should call updateUserUC.execute on update', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated',
      id: '21iu21',
    };
    const userDto: UserDto = { id: '1', name: 'Updated', email: 'test@test.com' };
    (updateUserUC.execute as jest.Mock).mockResolvedValue(userDto);

    const result = await service.update('1', updateUserDto);

    expect(updateUserUC.execute).toHaveBeenCalledWith('1', updateUserDto);
    expect(result).toBe(userDto);
  });

  it('should call deleteUserUC.execute on remove', async () => {
    (deleteUserUC.execute as jest.Mock).mockReturnValue(Promise.resolve(true));

    const result = await service.remove('1');

    expect(deleteUserUC.execute).toHaveBeenCalledWith('1');
    expect(result).toBe(true);
  });
});
