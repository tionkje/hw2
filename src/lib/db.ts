import dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

let cache: MongoClient;
export async function getMongoConnection(): Promise<MongoClient> {
  if (cache) return cache;

  return (cache = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }));
}

export async function closeConnection() {
  const client = await getMongoConnection();
  return client.close();
}
const timeout = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function lockDoc(col: any, q: Record<string, string>, ref: string) {
  let tries = 0;
  while (tries++ < 100) {
    const res = await col.findOneAndUpdate({ ...q, locked: { $exists: false } }, { $set: { locked: true } });

    if (res.value)
      return {
        doc: res.value,
        unlock: async (newDoc: unknown) => {
          await col.findOneAndReplace({ _id: res.value._id }, newDoc);
        },
      };
    console.log('fail', ref);
    timeout(100 * Math.random());
  }
  throw new Error(`Failed getting lock after ${tries} tries`);
}

export async function resetCount() {
  const client = await getMongoConnection();
  const col = client.db('hw').collection('counter');
  await col.deleteMany({});
}
async function getCountCol() {
  const client = await getMongoConnection();
  return client.db('hw').collection('counter');
}
export async function initCount() {
  const col = await getCountCol();
  const amount = await col.countDocuments();
  if (amount == 0) await col.insertOne({ count: 0 });
}
export async function count(ref?: string): Promise<number> {
  const col = await getCountCol();

  // console.log(await col.find().toArray());

  const { doc, unlock } = await lockDoc(col, {}, ref);

  doc.count++;

  await unlock(doc);

  return doc.count;
}
