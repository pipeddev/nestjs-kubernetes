import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { UsersDto } from 'src/users/services/dtos/responses/users.dto';
import { SelectUsersUseCase } from 'src/users/services/use-cases/select-users.uc';

jest.mock('src/users/model/repositories/users.repository');
jest.mock('src/users/services/dtos/responses/users.dto');

describe('SelectUsersUseCase', () => {
  let useCase: SelectUsersUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeAll(() => {
    usersRepository = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    useCase = new SelectUsersUseCase(usersRepository);
  });

  it('should call usersRepository.findAll and return UsersDto.valueOf result', async () => {
    const fakeUsers = [{ id: '1', name: 'John', email: 'john@example.com' }];
    const fakeDto = { users: fakeUsers };
    usersRepository.findAll.mockResolvedValue(fakeUsers);
    (UsersDto.valueOf as jest.Mock).mockReturnValue(fakeDto);

    const result = await useCase.execute();

    expect(usersRepository.findAll).toHaveBeenCalledTimes(1);
    expect(UsersDto.valueOf).toHaveBeenCalledWith(fakeUsers);
    expect(result).toBe(fakeDto);
  });
});
