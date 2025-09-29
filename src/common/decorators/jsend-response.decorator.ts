import { SetMetadata } from '@nestjs/common';

export const JSEND_RESPONSE_KEY = 'jsend_response';
export const JSendResponse = () => SetMetadata(JSEND_RESPONSE_KEY, true);
