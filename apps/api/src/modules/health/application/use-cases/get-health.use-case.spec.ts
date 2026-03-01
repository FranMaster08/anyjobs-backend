import { GetHealthUseCase } from './get-health.use-case';

describe(GetHealthUseCase.name, () => {
  it('returns ok status', () => {
    const uc = new GetHealthUseCase();
    expect(uc.execute()).toEqual({ status: 'ok' });
  });
});

