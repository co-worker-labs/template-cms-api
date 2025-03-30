import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { EnvKeys } from '../env-keys.enum';

@Injectable()
export class RedisKeyService {
  private readonly namespace: string;

  constructor(configService: ConfigService) {
    this.namespace = configService.getOrThrow<string>(EnvKeys.DATA_NAMESPACE);
  }
}
