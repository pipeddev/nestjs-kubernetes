import { Optional } from '@nestjs/common';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class UpdateUserDto extends BaseDTO {
  @Optional()
  name?: string;
  @Optional()
  email?: string;
}
