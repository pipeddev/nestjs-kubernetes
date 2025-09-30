import { UsersResolver } from 'src/users/resolvers/users.resolver';
import { UsersService } from 'src/users/services/users.service';
import { UsersDto, UserDto } from 'src/users/services/dtos/responses/users.dto';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(() => {
    usersService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;
    resolver = new UsersResolver(usersService);
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const users: UsersDto = { users: [{ id: '1', name: 'John' }] } as UsersDto;
      usersService.findAll.mockResolvedValue(users);

      const result = await resolver.getUsers();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toBe(users);
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      const user: UserDto = { id: '1', name: 'John' } as UserDto;
      usersService.findOne.mockResolvedValue(user);

      const result = await resolver.getUser('1');

      expect(usersService.findOne).toHaveBeenCalledWith('1');
      expect(result).toBe(user);
    });

    it('should return null if user not found', async () => {
      usersService.findOne.mockResolvedValue(null);

      const result = await resolver.getUser('2');

      expect(usersService.findOne).toHaveBeenCalledWith('2');
      expect(result).toBeNull();
    });
  });
});
