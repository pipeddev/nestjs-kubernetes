import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/users/controllers/users.controller';
import { CreateUserDto } from 'src/users/services/dtos/requests/create-user.dto';
import { UpdateUserDto } from 'src/users/services/dtos/requests/update-user.dto';
import { UsersService } from 'src/users/services/users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call usersService.create with the correct dto', async () => {
      const dto: CreateUserDto = { name: 'John', email: 'john@example.com' } as CreateUserDto;
      const result = { id: '1', ...dto };
      mockUsersService.create.mockResolvedValue(result);

      const response = await usersController.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(response).toBe(result);
    });
  });

  describe('update', () => {
    it('should call usersService.update with the correct id and dto', async () => {
      const id = '123';
      const dto: UpdateUserDto = { name: 'Jane' } as UpdateUserDto;
      const result = { ...dto, id };
      mockUsersService.update.mockResolvedValue(result);

      const response = await usersController.update(id, dto);

      expect(usersService.update).toHaveBeenCalledWith(id, dto);
      expect(response).toBe(result);
    });
  });

  describe('remove', () => {
    it('should call usersService.remove with the correct id', async () => {
      const id = '456';
      mockUsersService.remove.mockResolvedValue(undefined);

      const response = await usersController.remove(id);

      expect(usersService.remove).toHaveBeenCalledWith(id);
      expect(response).toBeUndefined();
    });
  });
});
