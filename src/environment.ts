/*import 'dotenv/config';

export const Environment = {
  DB_URL: process.env.DB_URL || '',
};*/

import { ConfigService } from '@nestjs/config';

export const getEnvironment = (configService: ConfigService) => ({
  DB_URL: configService.get<string>('DB_URL', ''),
});
