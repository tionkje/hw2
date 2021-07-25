import mongodb from 'mongodb';
import { Competition, Com } from './Competition';
import CompoConvert from './CompoConvert';
import { getCollection, lockDocument } from './db';
import { promises as fs } from 'fs';
import path from 'path';

const COMPO_COLLECTION = 'competition';

export async function doThing(_id: string): Promise<void> {
  const { doc, unlock } = await lockDocument(COMPO_COLLECTION, { _id });

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
  async function getFromDB() {
    const col = await getCollection(COMPO_COLLECTION);
    return (await col.find().toArray()).map((x) => ({ name: x.name, _id: x._id }));
  }

  async function getFromFile() {
    const fileList = (await fs.readdir(folder)).filter((x) => !x.match(/^new_/));

    return Promise.all(
      fileList.map(async (fileName) => {
        const content = JSON.parse(await fs.readFile(path.join(folder, fileName), 'utf8'));
        return { name: content.name, _id: fileName.replace(/\.json$/, ''), fromFile: true };
      })
    );
  }

  let dbList = getFromDB();
  let fileList = getFromFile();
  dbList = await dbList;
  fileList = await fileList;
  return dbList.concat(fileList);
}

export async function getCompetition(compid: string): Promise<string> {
  async function fromFile(compid: string) {
    const compdata = JSON.parse(await fs.readFile(path.join(folder, compid + '.json'), 'utf8'));
    return CompoConvert(compdata);
  }
  async function fromDB(compid) {
    compid = mongodb.ObjectID(compid);
    const col = await getCollection(COMPO_COLLECTION);
    return new Competition(await col.findOne({ _id: compid }));
  }

  let res;
  try {
    res = await fromFile(compid);
  } catch (e) {
    console.log('Getting from file failed, trying from DB', e);
    res = await fromDB(compid);
  }
  return res.createData();
}

export async function createCompetition() {
  const col = await getCollection(COMPO_COLLECTION);

  const res = await col.insertOne({ test: 'A' });
  return await col.findOne({ _id: res.insertedId });
}

export async function deleteCompetition(_id) {
  _id = mongodb.ObjectID(_id);
  const col = await getCollection(COMPO_COLLECTION);
  const res = await col.findOneAndDelete({ _id });
  if (!res.ok) return { status: 500, body: 'Failed deleting' };
  return { body: 'OK' };
}
