import { closeConnection, getCollection, lockDocument } from './db';

async function resetCount() {
  const col = await getCollection('counter');
  await col.deleteMany({});
}

async function initCount() {
  const col = await getCollection('counter');
  const amount = await col.countDocuments();
  if (amount == 0) await col.insertOne({ count: 0 });
}

async function count(): Promise<number> {
  const res = await lockDocument('counter', {});
  const unlock = res.unlock;
  const doc = res.doc as { count: number };

  doc.count++;

  await unlock(doc);

  return doc.count;
}

describe('db stuff', () => {
  afterAll(async () => {
    await closeConnection();
  });
  beforeEach(async () => {
    await resetCount();
    await initCount();
  });

  it('single count', async () => {
    const nr = await count();
    expect(nr).toBe(1);
  });

  it('operation is atomic', async () => {
    let nr = 0;
    const times = 4;
    async function countMulti() {
      for (let i = 0; i < times; i++) {
        await count();
        nr++;
      }
    }
    await Promise.all(
      Array(5)
        .fill(0)
        .map(async () => await countMulti())
    );

    expect(await count()).toBe(++nr);
  });
});
