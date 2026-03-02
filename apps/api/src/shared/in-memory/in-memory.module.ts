import { Global, Module } from '@nestjs/common';
import { InMemoryUsersStore } from './users.store';

@Global()
@Module({
  providers: [InMemoryUsersStore],
  exports: [InMemoryUsersStore],
})
export class InMemoryModule {}

