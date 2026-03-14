import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HealthModule } from './modules/health/health.module';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { OpenRequestsModule } from './modules/open-requests/open-requests.module';
import { SiteConfigModule } from './modules/site-config/site-config.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { CorrelationIdMiddleware } from './shared/correlation/correlation-id.middleware';
import { CorrelationModule } from './shared/correlation/correlation.module';
import { GlobalExceptionFilter } from './shared/errors/global-exception.filter';
import { AuthRbacGuard } from './shared/security/auth-rbac.guard';
import { InMemoryModule } from './shared/in-memory/in-memory.module';
import { PersistenceModule } from './shared/persistence/persistence.module';

@Module({
  imports: [
    AppConfigModule,
    CorrelationModule,
    InMemoryModule,
    PersistenceModule,
    HealthModule,
    AuthModule,
    UserProfileModule,
    OpenRequestsModule,
    SiteConfigModule,
    ProposalsModule,
  ],
  providers: [
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

