import dotenv from 'dotenv';
dotenv.config();

const { MONGODB_URI } = process.env;
const dbName = 'hw';

import mongodb, { Collection } from 'mongodb';

let cache: mongodb.MongoClient;
async function getMongoConnection(): Promise<mongodb.MongoClient> {
  if (cache) return cache;

  return (cache = await mongodb.MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }));
}

export async function closeConnection(): Promise<void> {
  if (!cache) return;
  const client = cache;
  cache = null;
  return client.close();
}

const timeout = (ms: number) => new Promise((r) => setTimeout(r, ms));
export async function lockDocument(
  _col: Collection | string,
  q: Record<string, string | mongodb.ObjectID>
): Promise<{ doc: Record<string, unknown>; unlock: (doc: Record<string, unknown>) => Promise<void> }> {
  let col: Collection;
  if (typeof _col == 'string') col = await getCollection(_col);
  else col = _col;

  let tries = 0;
  while (tries++ < 100) {
    // console.log('Getting lock on', q);
    const res = await col.findOneAndUpdate({ ...q, locked: { $exists: false } }, { $set: { locked: true } });

    if (res.value)
      return {
        doc: res.value,
        unlock: async (newDoc: Record<string, unknown>) => {
          await col.findOneAndReplace({ _id: res.value._id }, newDoc);
        },
      };
    await timeout(100 * Math.random());
  }
  throw new Error(`Failed getting lock after ${tries} tries`);
}

export async function getCollection(name: string): Promise<Collection> {
  const client = await getMongoConnection();
  return client.db(dbName).collection(name);
}
