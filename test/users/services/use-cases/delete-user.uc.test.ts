import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersRepository } from 'src/users/model/repositories/users.repository';
import { DeleteUserUC } from 'src/users/services/use-cases/delete-user.uc';

describe('DeleteUserUC', () => {
  let deleteUserUC: DeleteUserUC;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    deleteUserUC = new DeleteUserUC(repository);
  });

  it('should delete user if user exists', async () => {
    const userId = '123';
    repository.findById.mockResolvedValue({
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    });
    repository.delete.mockResolvedValue(undefined);

    await expect(deleteUserUC.execute(userId)).resolves.toBeUndefined();
    expect(repository.findById).toHaveBeenCalledWith(userId);
    expect(repository.delete).toHaveBeenCalledWith(userId);
  });

  it('should throw HttpException if user does not exist', async () => {
    const userId = '456';
    repository.findById.mockResolvedValue(null);

    await expect(deleteUserUC.execute(userId)).rejects.toThrow(HttpException);
    await expect(deleteUserUC.execute(userId)).rejects.toThrow('User not found');
    await expect(deleteUserUC.execute(userId)).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
    expect(repository.findById).toHaveBeenCalledWith(userId);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
