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

  it('should return null if findUserUC.execute returns null', async () => {
    (findUserUC.execute as jest.Mock).mockResolvedValue(null);

    const result = await service.findOne('non-existent-id');

    expect(findUserUC.execute).toHaveBeenCalledWith('non-existent-id');
    expect(result).toBeNull();
  });

  it('should propagate errors from selectUsersUseCase.execute', async () => {
    const error = new Error('Failed to fetch users');
    (selectUsersUseCase.execute as jest.Mock).mockRejectedValue(error);

    await expect(service.findAll()).rejects.toThrow('Failed to fetch users');
  });

  it('should propagate errors from findUserUC.execute', async () => {
    const error = new Error('User not found');
    (findUserUC.execute as jest.Mock).mockRejectedValue(error);

    await expect(service.findOne('1')).rejects.toThrow('User not found');
  });

  it('should propagate errors from createUserUC.execute', async () => {
    const error = new Error('Create failed');
    (createUserUC.execute as jest.Mock).mockRejectedValue(error);

    await expect(service.create({ name: 'Test', email: 'test@test.com' })).rejects.toThrow(
      'Create failed',
    );
  });

  it('should propagate errors from updateUserUC.execute', async () => {
    const error = new Error('Update failed');
    (updateUserUC.execute as jest.Mock).mockRejectedValue(error);

    await expect(service.update('1', { name: 'Updated' })).rejects.toThrow('Update failed');
  });

  it('should propagate errors from deleteUserUC.execute', async () => {
    const error = new Error('Delete failed');
    (deleteUserUC.execute as jest.Mock).mockRejectedValue(error);

    await expect(service.remove('1')).rejects.toThrow('Delete failed');
  });
});
