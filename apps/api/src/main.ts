import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { nestLoggerLevels } from './shared/logging/app-logger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logLevel = config.getOrThrow<'debug' | 'log' | 'warn' | 'error'>('logging.level');
  app.useLogger(nestLoggerLevels(logLevel));
  const port = config.getOrThrow<number>('app.port');

  const swaggerEnabled = config.get<boolean>('swagger.enabled') ?? false;
  const swaggerPath = config.get<string>('swagger.path') ?? 'docs';
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AnyJobs API')
      .setDescription('API backend AnyJobs')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document);
  }

  await app.listen(port);
}

void bootstrap();

