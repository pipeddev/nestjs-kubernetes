import { Resolver, Query, Args } from '@nestjs/graphql';
import { UsersService } from '../services/users.service';
import { UsersType, UserType } from '../services/graph-types/user.graph-type';
import { UserDto, UsersDto } from '../services/dtos/responses/users.dto';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UsersType)
  async getUsers(): Promise<UsersDto> {
    const users = await this.usersService.findAll();
    return users;
  }

  @Query(() => UserType, { nullable: true })
  async getUser(@Args('id', { type: () => String }) id: string): Promise<UserDto | null> {
    return this.usersService.findOne(id);
  }
}
