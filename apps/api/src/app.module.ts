import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HealthModule } from './modules/health/health.module';
import { AppConfigModule } from './config/config.module';
import { CorrelationIdMiddleware } from './shared/correlation/correlation-id.middleware';
import { CorrelationIdService } from './shared/correlation/correlation-id.service';
import { GlobalExceptionFilter } from './shared/errors/global-exception.filter';
import { AuthRbacGuard } from './shared/security/auth-rbac.guard';

@Module({
  imports: [
    AppConfigModule,
    HealthModule,
  ],
  providers: [
    CorrelationIdService,
    {
      provide: APP_GUARD,
      useClass: AuthRbacGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}

