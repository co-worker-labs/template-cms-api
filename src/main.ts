import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { EnvKeys } from './common/env-keys.enum';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { ExceptionCacheFilter } from './common/exception/exception-cache.filter';
import helmet from 'helmet';
import * as session from 'express-session';
import { genUUID } from './common/fns';
import { RedisStore } from 'connect-redis';
import { RedisService } from './common/redis-manager/redis-manager.service';
import parse from 'parse-duration';

function setupSession(app: INestApplication) {
  const redisService = app.get(RedisService);
  const config = app.get(ConfigService);

  const namespace = config.getOrThrow<string>(EnvKeys.DATA_NAMESPACE);
  const secret = config.getOrThrow<string>(EnvKeys.SESSION_SECRET);
  const secure = config.get<string>(EnvKeys.SESSION_SECURE);
  const maxAge = config.get<string>(EnvKeys.SESSION_MAX_AGE);
  const maxAgeInMilliSeconds = parse(maxAge || '30m');
  app.use(
    session({
      cookie: {
        httpOnly: true,
        secure: secure !== 'false',
        maxAge: maxAgeInMilliSeconds,
        sameSite: 'lax',
        path: '/',
      },
      secret: secret,
      resave: false,
      saveUninitialized: false,
      genid: genUUID,
      rolling: true,
      store: new RedisStore({
        client: redisService.getClient(),
        prefix: `${namespace}:cms-session:`,
        ttl: maxAgeInMilliSeconds,
      }),
      unset: 'destroy',
      proxy: true,
    }),
  );
}

function setupCors(app: INestApplication) {
  const config = app.get(ConfigService);
  const origin = config.get(EnvKeys.CORS_ORIGIN);
  app.enableCors({
    origin: origin
      ? origin.split(',')
      : (origin, callback) => {
          callback(null, true);
        },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'Accept',
      'Cookie',
      'Access-Control-Allow-Methods',
    ],
    credentials: true,
    exposedHeaders: 'set-cookie',
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );
  const httpAdapter = app.get(HttpAdapterHost);
  const i18nService = app.get(I18nService);
  app.useGlobalFilters(
    new ExceptionCacheFilter(httpAdapter, i18nService as any),
  );

  setupSession(app);
  setupCors(app);
  app.use(helmet());

  const config = app.get(ConfigService);
  const contextPath = config.get<string>(EnvKeys.CONTEXT_PATH);
  if (contextPath) {
    app.setGlobalPrefix(contextPath);
  }

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  // 捕获 SIGINT 和 SIGTERM 信号
  const gracefulShutdown = () => {
    console.log(`Received shutdown signal, closing HTTP server...`);
    // 调用close方法会处理完目前已有的链接
    app.flushLogs();
    app.close();
    process.exit(0);
  };
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

bootstrap();
