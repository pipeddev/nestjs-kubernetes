import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersRepository } from 'src/users/model/repositories/users.repository';

@Injectable()
export class DeleteUserUC {
  constructor(private readonly repository: UsersRepository) {}

  async execute(id: number): Promise<void> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.repository.delete(id);
  }
}
