import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Cluster as RedisCluster } from 'ioredis';
import { EnvKeys } from '../env-keys.enum';
import { RedisKeyService } from './redis-key.service';
import Keyv, { KeyvHooks } from 'keyv';
import KeyvRedis from '@keyv/redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly namespace: string;
  private readonly client: RedisCluster | Redis;
  private readonly keyv: Keyv;

  constructor(
    configService: ConfigService,
    private readonly keyService: RedisKeyService,
  ) {
    this.namespace = configService.getOrThrow<string>(EnvKeys.DATA_NAMESPACE);
    const redis_url = configService.getOrThrow<string>(EnvKeys.REDIS_URL);

    this.client = RedisService.createClient(redis_url);

    this.keyv = new Keyv({
      store: new KeyvRedis(redis_url, {
        useUnlink: false,
      }),
      namespace: this.namespace,
      useKeyPrefix: false,
    });
    this.keyv.on('error', (error) => {
      this.logger.error(`Keyv Error: ${error.message}`, error.stack);
    });
    this.keyv.store.client.on('connect', () => {
      this.logger.log('KeyvRedis client connected');
    });
    this.keyv.store.client.on('reconnecting', () => {
      this.logger.log('KeyvRedis client reconnecting');
    });
    this.keyv.store.client.on('end', () => {
      this.logger.log('KeyvRedis client disconnected');
    });
    [KeyvHooks.PRE_SET, KeyvHooks.PRE_DELETE].forEach((hook) => {
      this.keyv.hooks.addHandler(hook, (key, value) => {
        this.logger.log({ tag: 'keyv', action: hook, key, value });
      });
    });
    [KeyvHooks.POST_GET, KeyvHooks.POST_GET_MANY].forEach((hook) => {
      this.keyv.hooks.addHandler(hook, (key, value) => {
        this.logger.debug({ tag: 'keyv', action: hook, key, value });
      });
    });
  }

  async onModuleDestroy() {
    this.client.disconnect();
    await this.keyv.disconnect();
  }

  static createClient(redis_url: string) {
    const urls = redis_url.split(',').filter((it) => !!it);
    return urls.length > 1 ? new RedisCluster(urls) : new Redis(urls[0]);
  }

  getClient() {
    return this.client;
  }

  getKeyvClient() {
    return this.keyv;
  }

  keys() {
    return this.keyService;
  }
}
