import { CompetitionData, ThrowerData, Competition } from './Competition';
import { strict as assert } from 'assert';

type Height = number;
type OldCategoryId = string;
type OldJudge = 'X' | 'V' | 'S';
type OldAttempts = Record<Height, [OldJudge, OldJudge?, OldJudge?]>;

type OldThrowerData = {
  name: string;
  categoryid: OldCategoryId;
  startHeight: Height;
  hwId: number;
  nr: number;
  rugnr: number;
  attempts: OldAttempts;
  skipHeight?: Height;
  eliminated?: Height;
  rankNr: number;
};

type OldCategoryData = {
  name: string;
  id: string;
  startHeight: Height;
};

type OldCompetitionData = {
  name: string;
  throwers: Array<OldThrowerData>;
  categories: Record<string, OldCategoryData>;
};

const copy = (x: unknown) => JSON.parse(JSON.stringify(x));

export default function CompoConvert(old: OldCompetitionData): Competition {
  const compo: CompetitionData = {};
  compo.name = old.name;

  const catIdMap = {};
  compo.categories = [];
  Object.keys(old.categories).forEach((catId) => {
    const cat = old.categories[catId];
    assert.equal(catId, cat.id);
    const id = compo.categories.push({ name: cat.name }) - 1;
    catIdMap[cat.id] = id;
  });

  compo.throwers = [];
  old.throwers.forEach((oldThrower) => {
    const thrower: ThrowerData = {};
    thrower.name = oldThrower.name;
    thrower.hwId = oldThrower.hwId;
    thrower.rugnr = oldThrower.rugnr;

    // convert to single skipHeight variable
    const skippedHeights = Object.keys(oldThrower.attempts)
      .map((x) => Number(x))
      .filter((h) => oldThrower.attempts[h].includes('S'))
      .sort((a, b) => b - a);
    thrower.skipHeight = Math.max(Number(skippedHeights[0] || 0), oldThrower.startHeight);

    // delete 'S' (skipped) heights
    const newAttempts = copy(oldThrower.attempts);
    skippedHeights.forEach((h) => delete newAttempts[h]);

    thrower.categories = {};
    const catId = catIdMap[oldThrower.categoryid];
    thrower.categories[catId] = newAttempts;

    assert(!compo.throwers[oldThrower.nr - 1]);
    compo.throwers[oldThrower.nr - 1] = thrower;
  });

  return new Competition(compo);
}
