import { User } from 'src/users/model/entities/user.entity';
import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { UsersDto } from 'src/users/services/dtos/responses/users.dto';
import { SelectUsersUseCase } from 'src/users/services/use-cases/select-users.uc';

jest.mock('src/users/model/repositories/users.repository');

describe('SelectUsersUseCase', () => {
  let useCase: SelectUsersUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    usersRepository = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    useCase = new SelectUsersUseCase(usersRepository);
  });

  it('should call usersRepository.findAll and return UsersDto', async () => {
    const fakeUsers = [{ id: '1', name: 'John', email: 'john@example.com' }];
    usersRepository.findAll.mockResolvedValue(fakeUsers);

    const result = await useCase.execute();

    expect(usersRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(UsersDto);
    expect(result.users).toEqual(fakeUsers);
  });

  it('should handle empty users array', async () => {
    const emptyUsers: any[] = [];
    usersRepository.findAll.mockResolvedValue(emptyUsers);

    const result = await useCase.execute();

    expect(usersRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result.users).toEqual([]);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database connection failed');
    usersRepository.findAll.mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow('Database connection failed');
    expect(usersRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple users', async () => {
    const multipleUsers = [
      { id: '1', name: 'John', email: 'john@example.com' },
      { id: '2', name: 'Jane', email: 'jane@example.com' },
      { id: '3', name: 'Bob', email: 'bob@example.com' },
    ];
    usersRepository.findAll.mockResolvedValue(multipleUsers);

    const result = await useCase.execute();

    expect(usersRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result.users).toEqual(multipleUsers);
    expect(result.users).toHaveLength(3);
  });

  // Añadimos tests específicos para cubrir casos borde del DTO
  it('should handle users with null values and transform them', async () => {
    const usersWithNull = [
      { id: '1', name: null, email: 'john@example.com' },
      { id: '2', name: 'Jane', email: null },
    ] as unknown as User[];

    usersRepository.findAll.mockResolvedValue(usersWithNull);

    const result = await useCase.execute();

    // Verificamos la transformación que hace el DTO
    expect(result.users[0].name).toBe('');
    expect(result.users[1].email).toBe('');
    expect(result.users[0].id).toBe('1');
    expect(result.users[1].name).toBe('Jane');

    // O si prefieres comparar toda la estructura resultante:
    expect(result.users).toEqual([
      { id: '1', name: '', email: 'john@example.com' },
      { id: '2', name: 'Jane', email: '' },
    ]);
  });

  it('should handle users with undefined values', async () => {
    const usersWithUndefined = [
      { id: '1', name: undefined, email: 'john@example.com' } as unknown as User,
    ];
    usersRepository.findAll.mockResolvedValue(usersWithUndefined);

    const result = await useCase.execute();

    // Verificar que undefined se convierte a cadena vacía
    expect(result.users[0].name).toBe('');
    expect(result.users[0].id).toBe('1');
    expect(result.users[0].email).toBe('john@example.com');

    // O verificar la estructura completa transformada
    expect(result.users).toEqual([{ id: '1', name: '', email: 'john@example.com' }]);
  });

  // Test para cubrir cualquier lógica adicional en el DTO
  it('should create a new DTO directly', () => {
    const dto = new UsersDto();
    dto.users = [{ id: '1', name: 'Direct', email: 'direct@test.com' }];

    expect(dto.users).toHaveLength(1);
    expect(dto.users[0].name).toBe('Direct');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
