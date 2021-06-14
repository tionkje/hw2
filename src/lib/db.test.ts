import { count, closeConnection, resetCount, initCount } from './db';

describe('db stuff', () => {
  afterAll(async () => {
    await closeConnection();
  });
  beforeEach(async () => {
    await resetCount();
    await initCount();
  });

  it('single count', async () => {
    const nr = await count('single');
    expect(nr).toBe(1);
  });

  it('operation is atomic', async () => {
    let nr = 0;
    const times = 4;
    async function countMulti(ref: string) {
      for (let i = 0; i < times; i++) {
        await count(ref + '_' + i);
        nr++;
      }
    }
    await Promise.all(
      Array(5)
        .fill(0)
        .map(async (_, i) => await countMulti(i + ''))
    );

    expect(await count('final')).toBe(++nr);
  });
});
