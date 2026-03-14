import { PingDatabaseUseCase } from './ping-database.use-case';
import { HealthDbProbePort } from '../ports';

describe('PingDatabaseUseCase', () => {
  it('delegates to probe port', async () => {
    const probe: HealthDbProbePort = { ping: jest.fn().mockResolvedValue(undefined) };
    const useCase = new PingDatabaseUseCase(probe);

    await useCase.execute();

    expect(probe.ping).toHaveBeenCalledTimes(1);
  });
});

