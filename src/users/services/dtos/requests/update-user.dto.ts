import { Optional } from '@nestjs/common';
import { IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsNumber()
  id: number;

  @Optional()
  name?: string;
  @Optional()
  email?: string;
}
