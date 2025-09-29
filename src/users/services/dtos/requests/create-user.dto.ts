import { IsEmail, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class CreateUserDto extends BaseDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
