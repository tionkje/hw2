import { Competition } from './Competition';
import { getCollection, lockDocument } from './db';

export async function doThing(_id: string): Promise<void> {
  const { doc, unlock } = await lockDocument('competition', { _id });

  try {
    const competition = new Competition(doc);

    console.log(competition);
    // doc.count++;
  } catch (e) {
    console.error(`failed`, e);
  } finally {
    await unlock(doc);
  }
}

export async function getCompetitions(): Promise<Record<string, unknown>[]> {
  const col = await getCollection('competition');

  return await col.find().toArray();
}
