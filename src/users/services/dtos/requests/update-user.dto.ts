import { Optional } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class UpdateUserDto extends BaseDTO {
  @IsUUID()
  id: string;

  @Optional()
  name?: string;
  @Optional()
  email?: string;
}
