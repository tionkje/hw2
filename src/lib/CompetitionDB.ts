import { Competition } from './Competition';
import { closeConnection, getCollection, lockDocument } from './db';

async function doThing(_id) {
  const { doc, unlock } = await lockDocument('competition', { _id });

  try {
    const competition = new Competition(doc);

    // doc.count++;
  } catch (e) {
    console.error(`failed`, e);
  } finally {
    await unlock(doc);
  }
}

export async function getCompetitions() {
  const col = await getCollection('competition');

  return await col.find().toArray();
}
