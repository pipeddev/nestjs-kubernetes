import { Controller, Post, Body, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../services/dtos/requests/create-user.dto';
import { UpdateUserDto } from '../services/dtos/requests/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() userData: UpdateUserDto) {
    return this.usersService.update(id, userData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
