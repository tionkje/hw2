import { Competition, Com } from './Competition';
import CompoConvert from './CompoConvert';
import { getCollection, lockDocument } from './db';
import { promises as fs } from 'fs';
import path from 'path';

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

type CompetitionHeader = {
  id: string;
  name: string;
};

const folder = 'static/wedstrijdData';

export async function getList(): Promise<CompetitionHeader[]> {
  // const col = await getCollection('competition');
  // return await col.find().toArray();

  const list = (await fs.readdir(folder)).filter((x) => !x.match(/^new_/));

  return Promise.all(
    list.map(async (x) => {
      const content = JSON.parse(await fs.readFile(path.join(folder, x), 'utf8'));
      return { name: content.name, id: x };
    })
  );
}

export async function getCompetition(compid: string): Promise<string> {
  const compdata = JSON.parse(await fs.readFile(path.join(folder, compid), 'utf8'));
  const comp = CompoConvert(compdata);
  return JSON.stringify(comp.createData());
}
