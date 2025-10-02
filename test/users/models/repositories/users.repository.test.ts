import { User } from 'src/users/model/entities/user.entity';
import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { Repository } from 'typeorm';

jest.mock('typeorm', () => {
  const actual: typeof import('typeorm') = jest.requireActual('typeorm');
  return {
    ...actual,
    Repository: jest.fn().mockImplementation(
      (): Partial<Repository<User>> => ({
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
      }),
    ),
  };
});

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let mockRepo: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    mockRepo = new (Repository as any)() as jest.Mocked<Repository<User>>;
    usersRepository = new UsersRepository(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users ordered by id ASC', async () => {
      const users = [{ id: '1' }, { id: '2' }] as User[];
      mockRepo.find.mockResolvedValue(users);

      const result = await usersRepository.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
      expect(result).toBe(users);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const user = { id: '1' } as User;
      mockRepo.findOne.mockResolvedValue(user);

      const result = await usersRepository.findById('1');

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBe(user);
    });

    it('should return null if user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await usersRepository.findById('2');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save and return the user', async () => {
      const user = { id: '1', email: 'test@test.com' } as User;
      mockRepo.save.mockResolvedValue(user);

      const result = await usersRepository.save(user);

      expect(mockRepo.save).toHaveBeenCalledWith(user);
      expect(result).toBe(user);
    });
  });

  describe('delete', () => {
    it('should call delete with the correct id', async () => {
      const deleteResult = { affected: 1, raw: {} };
      mockRepo.delete.mockResolvedValue(deleteResult);

      await usersRepository.delete('1');

      expect(mockRepo.delete).toHaveBeenCalledWith('1');
    });

    it('should handle deletion of non-existing user', async () => {
      const deleteResult = { affected: 0, raw: {} };
      mockRepo.delete.mockResolvedValue(deleteResult);

      await usersRepository.delete('999');

      expect(mockRepo.delete).toHaveBeenCalledWith('999');
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: '1', email: 'test@test.com' } as User;
      mockRepo.findOne.mockResolvedValue(user);

      const result = await usersRepository.findByEmail('test@test.com');

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(result).toBe(user);
    });

    it('should return null if user not found by email', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await usersRepository.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });
  });
});
