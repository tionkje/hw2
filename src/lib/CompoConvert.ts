import { CompetitionData, ThrowerData, Competition } from './Competition';
import { strict as assert } from 'assert';

type Height = number;
type OldCategoryId = string;
// type OldJudge = 'X' | 'V' | 'S';
type OldJudge = string;
// type OldAttempts = [OldJudge, OldJudge?, OldJudge?];
type OldAttempts = OldJudge[];

type OldThrowerData = {
  name: string;
  categoryid: OldCategoryId;
  startHeight: Height;
  hwId: number;
  nr: number;
  rugnr: number;
  attempts: Record<Height, OldAttempts>;
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

    const heights = Object.keys(oldThrower.attempts)
      .map((x) => Number(x))
      .filter((h) => oldThrower.attempts[h].includes('S'))
      .sort((a, b) => b - a);
    thrower.skipHeight = Math.max(Number(heights[0] || 0), oldThrower.startHeight);

    thrower.categories = {};
    const catId = catIdMap[oldThrower.categoryid];
    thrower.categories[catId] = oldThrower.attempts;

    compo.throwers.push(thrower);
  });

  return new Competition(compo);
}
