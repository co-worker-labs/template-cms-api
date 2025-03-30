import { SetMetadata } from '@nestjs/common';

export const ALLOW_ANON_KEY = 'isPublic';
export const AllowAnon = () => SetMetadata(ALLOW_ANON_KEY, true);
