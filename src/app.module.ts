import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import * as path from 'node:path';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvKeys } from './common/env-keys.enum';
import { LoggerModule } from 'nestjs-pino';
import { buildPinoOption } from './common/pino';
import { RedisManagerModule } from './common/redis-manager/redis-manager.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheManagerModule } from './common/cache-manager/cache-manager.module';
import { ManagerModule } from './manager/manager.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationOptions: {
        allowUnknown: true,
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: buildPinoOption(),
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage:
          configService.get<string>(EnvKeys.FALLBACK_LANGUAGE) || 'en',
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      inject: [ConfigService],
      logging: true,
    }),
    RedisManagerModule,
    CacheManagerModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    AuthModule,
    ManagerModule,
  ],
})
export class AppModule {}
