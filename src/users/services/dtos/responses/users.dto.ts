import { User } from 'src/users/model/entities/user.entity';

export class UsersDto {
  users: UserDto[];

  static valueOf(users: User[]): UsersDto {
    const dto = new UsersDto();
    dto.users = users.map((user) => UserDto.valueOf(user));
    return dto;
  }
}

export class UserDto {
  id: number;
  name: string;
  email: string;

  static valueOf(user: User | null): UserDto {
    const dto = new UserDto();
    dto.id = user?.id ?? 0;
    dto.name = user?.name ?? '';
    dto.email = user?.email ?? '';
    return dto;
  }
}

export class UserTestDto {
  user: UserDto;

  static valueOf(user: User | null): UserTestDto {
    const dto = new UserTestDto();
    dto.user = UserDto.valueOf(user);
    return dto;
  }
}
