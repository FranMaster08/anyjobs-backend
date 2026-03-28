import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, config: ConfigService): void {
  const swaggerEnabled = config.get<boolean>('swagger.enabled') ?? false;
  const swaggerPath = config.get<string>('swagger.path') ?? 'docs';
  const swaggerAuthEnabled = config.get<boolean>('swagger.authEnabled') ?? true;
  const nodeEnv = config.get<'development' | 'test' | 'production'>('app.nodeEnv') ?? 'development';
  const interactiveSwaggerAuthEnabled = swaggerEnabled && nodeEnv === 'development' && swaggerAuthEnabled;

  if (!swaggerEnabled) {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AnyJobs API')
    .setDescription('API backend AnyJobs')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Use `Bearer <token>` obtenido desde `POST /auth/login`.',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(swaggerPath, app, document, {
    customCss: interactiveSwaggerAuthEnabled
      ? undefined
      : '.scheme-container .auth-wrapper, .opblock .authorization__btn { display: none !important; }',
    swaggerOptions: {
      persistAuthorization: interactiveSwaggerAuthEnabled,
    },
  });
}
