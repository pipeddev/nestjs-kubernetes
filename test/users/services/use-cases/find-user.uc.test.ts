import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { UserDto } from 'src/users/services/dtos/responses/users.dto';
import { FindUserUC } from 'src/users/services/use-cases/find-user.uc';

jest.mock('src/users/model/repositories/users.repository');
jest.mock('src/users/services/dtos/responses/users.dto');

describe('FindUserUC', () => {
  let usersRepository: jest.Mocked<UsersRepository>;
  let findUserUC: FindUserUC;

  beforeAll(() => {
    usersRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    findUserUC = new FindUserUC(usersRepository);
  });

  it('should return UserDto when user is found', async () => {
    const user = { id: '1', name: 'John Doe', email: 'john.doe@example.com' };
    const userDto = { id: '1', name: 'John Doe', someDtoProp: true };
    usersRepository.findById.mockResolvedValue(user);
    (UserDto.valueOf as jest.Mock).mockReturnValue(userDto);

    const result = await findUserUC.execute('1');

    expect(usersRepository.findById).toHaveBeenCalledWith('1');
    expect(UserDto.valueOf).toHaveBeenCalledWith(user);
    expect(result).toBe(userDto);
  });

  it('should return null when user is not found', async () => {
    usersRepository.findById.mockResolvedValue(null);
    (UserDto.valueOf as jest.Mock).mockReturnValue(null);

    const result = await findUserUC.execute('2');

    expect(usersRepository.findById).toHaveBeenCalledWith('2');
    expect(UserDto.valueOf).toHaveBeenCalledWith(null);
    expect(result).toBeNull();
  });
});
