import dotenv from 'dotenv';
dotenv.config();

const { MONGODB_URI } = process.env;
const dbName = 'hw';

import mongodb from 'mongodb';
const { MongoClient } = mongodb;

let cache: MongoClient;
async function getMongoConnection(): Promise<MongoClient> {
  if (cache) return cache;

  return (cache = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }));
}

export async function closeConnection(): Promise<void> {
  const client = await getMongoConnection();
  return client.close();
}

const timeout = (ms: number) => new Promise((r) => setTimeout(r, ms));
export async function lockDocument(col: any | string, q: Record<string, string>) {
  if (typeof col == 'string') col = await getCollection(col);

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
    timeout(100 * Math.random());
  }
  throw new Error(`Failed getting lock after ${tries} tries`);
}

export async function getCollection(name: string) {
  const client = await getMongoConnection();
  return client.db(dbName).collection(name);
}
