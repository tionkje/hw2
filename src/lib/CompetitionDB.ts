import mongodb from 'mongodb';
import { Competition, CompetitionData } from './Competition';
import CompoConvert from './CompoConvert';
import { getCollection, lockDocument } from './db';
import { promises as fs } from 'fs';
import path from 'path';

const COMPO_COLLECTION = 'competition';

type Action = {
  func: string;
  args: string[];
};

export async function processCompo(
  _id: string | mongodb.ObjectID,
  actions: Action | Action[]
): Promise<CompetitionData> {
  if (!_id || _id == 'undefined') throw new Error(`Missing parameter _id`);
  _id = new mongodb.ObjectID(_id);
  const result = await lockDocument(COMPO_COLLECTION, { _id });
  const { unlock } = result;
  let doc = result.doc as Record<string, string | mongodb.ObjectID>;

  if (!Array.isArray(actions)) actions = [actions];
  console.log(`processCompo: `, actions);

  try {
    const competition = new Competition(doc);

    let action: Action;
    while ((action = actions.shift())) {
      const { func, args } = action;
      await competition[func](...args);
    }

    doc = competition.createData();
    doc._id = new mongodb.ObjectID(doc._id);
    return doc;
  } catch (e) {
    console.error(`failed`, e);
  } finally {
    // console.log('final', doc);
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

    return (
      await Promise.all(
        fileList.map(async (fileName) => {
          const fn = path.join(folder, fileName);
          const finfo = await fs.stat(fn);
          if (!finfo.isFile()) return;
          let content;
          try {
            content = JSON.parse(await fs.readFile(fn, 'utf8'));
          } catch (e) {
            console.log('Failed getting file', e);
          }
          return { name: content?.name, _id: fileName.replace(/\.json$/, ''), fromFile: true };
        })
      )
    ).filter((x) => x);
  }

  let dbList = getFromDB();
  let fileList = getFromFile();
  dbList = await dbList;
  fileList = await fileList;
  return dbList.concat(fileList);
}

async function getOldCompetition(compid: string): Promise<string> {
  const compdata = JSON.parse(await fs.readFile(path.join(folder, compid + '.json'), 'utf8'));
  return CompoConvert(compdata).createData();
}

export async function getCompetition(compid: string): Promise<string> {
  if (compid.match(/^old_/)) return getOldCompetition(compid.replace(/^old_/, ''));
  const col = await getCollection(COMPO_COLLECTION);
  let comp;
  if (mongodb.ObjectID.isValid(compid)) {
    const compObjId = mongodb.ObjectID(compid);
    comp = await col.findOne({ _id: compObjId });
  }
  if (!comp) comp = await col.findOne({ name: compid });
  if (!comp) throw new Error(`Competition ${compid} not found`);
  const res = new Competition(comp);
  return res.createData();
}

export async function createCompetition() {
  const col = await getCollection(COMPO_COLLECTION);

  const compo = JSON.parse(JSON.stringify(new Competition({})));

  const res = await col.insertOne(compo);
  return await col.findOne({ _id: res.insertedId });
}

export async function deleteCompetition(_id) {
  _id = mongodb.ObjectID(_id);
  const col = await getCollection(COMPO_COLLECTION);
  const res = await col.findOneAndDelete({ _id });
  if (!res.ok) return { status: 500, body: 'Failed deleting' };
  return { body: 'OK' };
}
