import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from 'src/users/model/entities/user.entity';
import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { UpdateUserDto } from 'src/users/services/dtos/requests/update-user.dto';
import { UserDto } from 'src/users/services/dtos/responses/users.dto';
import { UpdateUserUC } from 'src/users/services/use-cases/update-user.uc';

jest.mock('src/users/model/repositories/users.repository');

describe('UpdateUserUC', () => {
  let updateUserUC: UpdateUserUC;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    updateUserUC = new UpdateUserUC(repository);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update user name and email', async () => {
      const user: User = { id: '1', name: 'Old Name', email: 'old@email.com' } as User;
      const updateUserDto: UpdateUserDto = { name: 'New Name', email: 'new@email.com' };
      repository.findById.mockResolvedValue(user);
      repository.save.mockResolvedValue({ ...user, ...updateUserDto });
      const userDto = { id: '1', name: 'New Name', email: 'new@email.com' };
      jest.spyOn(UserDto, 'valueOf').mockReturnValue(userDto);

      const result = await updateUserUC.execute('1', updateUserDto);

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Name',
          email: 'new@email.com',
        }),
      );
      expect(result).toEqual(userDto);
    });

    it('should update only user name if email is not provided', async () => {
      const user: User = { id: '2', name: 'Old Name', email: 'old@email.com' } as User;
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      repository.findById.mockResolvedValue(user);
      repository.save.mockResolvedValue({ ...user, name: updateUserDto.name ?? user.name });
      const userDto = { id: '2', name: 'Updated Name', email: 'old@email.com' };
      jest.spyOn(UserDto, 'valueOf').mockReturnValue(userDto);

      const result = await updateUserUC.execute('2', updateUserDto);

      expect(repository.findById).toHaveBeenCalledWith('2');
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name',
          email: 'old@email.com',
        }),
      );
      expect(result).toEqual(userDto);
    });

    it('should update only user email if name is not provided', async () => {
      const user: User = { id: '3', name: 'Old Name', email: 'old@email.com' } as User;
      const updateUserDto: UpdateUserDto = { email: 'updated@email.com' };
      repository.findById.mockResolvedValue(user);
      repository.save.mockResolvedValue({ ...user, email: updateUserDto.email ?? user.email });
      const userDto = { id: '3', name: 'Old Name', email: 'updated@email.com' };
      jest.spyOn(UserDto, 'valueOf').mockReturnValue(userDto);

      const result = await updateUserUC.execute('3', updateUserDto);

      expect(repository.findById).toHaveBeenCalledWith('3');
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Old Name',
          email: 'updated@email.com',
        }),
      );
      expect(result).toEqual(userDto);
    });

    it('should not update user if no fields are provided in updateUserDto', async () => {
      const user: User = { id: '4', name: 'Original Name', email: 'original@email.com' } as User;
      const updateUserDto: UpdateUserDto = {};
      repository.findById.mockResolvedValue(user);
      repository.save.mockResolvedValue(user);
      const userDto = { id: '4', name: 'Original Name', email: 'original@email.com' };
      jest.spyOn(UserDto, 'valueOf').mockReturnValue(userDto);

      const result = await updateUserUC.execute('4', updateUserDto);

      expect(repository.findById).toHaveBeenCalledWith('4');
      expect(repository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(userDto);
    });

    it('should throw HttpException if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(updateUserUC.execute('notfound', { name: 'Test' })).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException if user is undefined', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(updateUserUC.execute('undefined', { name: 'Test' })).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle empty string values in updateUserDto', async () => {
      const user: User = { id: '5', name: 'Original Name', email: 'original@email.com' } as User;
      const updateUserDto: UpdateUserDto = { name: '', email: '' };
      repository.findById.mockResolvedValue(user);
      repository.save.mockResolvedValue(user);
      const userDto = { id: '5', name: 'Original Name', email: 'original@email.com' };
      jest.spyOn(UserDto, 'valueOf').mockReturnValue(userDto);

      const result = await updateUserUC.execute('5', updateUserDto);

      expect(repository.findById).toHaveBeenCalledWith('5');
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Original Name',
          email: 'original@email.com',
        }),
      );
      expect(result).toEqual(userDto);
    });

    it('should throw error when repository findById fails', async () => {
      const updateUserDto: UpdateUserDto = { name: 'New Name' };
      repository.findById.mockRejectedValue(new Error('Database connection error'));

      await expect(updateUserUC.execute('6', updateUserDto)).rejects.toThrow(
        'Database connection error',
      );
    });

    it('should throw error when repository save fails', async () => {
      const user: User = { id: '7', name: 'Test Name', email: 'test@email.com' } as User;
      const updateUserDto: UpdateUserDto = { name: 'New Name' };
      repository.findById.mockResolvedValue(user);
      repository.save.mockRejectedValue(new Error('Database save error'));

      await expect(updateUserUC.execute('7', updateUserDto)).rejects.toThrow('Database save error');
    });

    it('should call UserDto.valueOf with updated user', async () => {
      const user: User = { id: '8', name: 'Old Name', email: 'old@email.com' } as User;
      const updateUserDto: UpdateUserDto = { name: 'New Name' };
      repository.findById.mockResolvedValue(user);
      repository.save.mockResolvedValue({ ...user, name: 'New Name' });
      const userDto = { id: '8', name: 'New Name', email: 'old@email.com' };
      const valueOfSpy = jest.spyOn(UserDto, 'valueOf').mockReturnValue(userDto);

      await updateUserUC.execute('8', updateUserDto);

      expect(valueOfSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '8',
          name: 'New Name',
          email: 'old@email.com',
        }),
      );
    });
  });

  describe('ofUser', () => {
    it('should update only name when email is undefined', () => {
      const user: User = { id: '9', name: 'Old Name', email: 'old@email.com' } as User;
      const updateUserDto: UpdateUserDto = { name: 'New Name' };

      const result = updateUserUC['ofUser'](user, updateUserDto);

      expect(result.name).toBe('New Name');
      expect(result.email).toBe('old@email.com');
    });

    it('should update only email when name is undefined', () => {
      const user: User = { id: '10', name: 'Old Name', email: 'old@email.com' } as User;
      const updateUserDto: UpdateUserDto = { email: 'new@email.com' };

      const result = updateUserUC['ofUser'](user, updateUserDto);

      expect(result.name).toBe('Old Name');
      expect(result.email).toBe('new@email.com');
    });

    it('should not update fields when both name and email are empty strings', () => {
      const user: User = { id: '11', name: 'Old Name', email: 'old@email.com' } as User;
      const updateUserDto: UpdateUserDto = { name: '', email: '' };

      const result = updateUserUC['ofUser'](user, updateUserDto);

      expect(result.name).toBe('Old Name');
      expect(result.email).toBe('old@email.com');
    });

    it('should return the same user instance when no updates are provided', () => {
      const user: User = { id: '12', name: 'Old Name', email: 'old@email.com' } as User;
      const updateUserDto: UpdateUserDto = {};

      const result = updateUserUC['ofUser'](user, updateUserDto);

      expect(result).toBe(user);
      expect(result.name).toBe('Old Name');
      expect(result.email).toBe('old@email.com');
    });
  });
});
