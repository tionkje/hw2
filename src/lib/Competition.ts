import { strict as assert } from 'assert';

export type ThrowerId = number;
export type CategoryId = number;
export type MeterId = number;
export type Height = number;
export type Judge = 'X' | 'V';
export type Attempts = Record<Height, [Judge, Judge?, Judge?]>;

export type ThrowerData = {
  name?: string;
  categories?: Record<CategoryId, Attempts>;
  skipHeight?: Height;
  rank?: number;
  hwId?: number;
  rugnr?: number;
  success?: Height;
  eliminated?: boolean[];
};

const getFailedAttemptCount = (throws: [Judge, Judge?, Judge?]) => {
  return throws?.filter((x) => x == 'X').length || 0;
};

class Thrower {
  name: string;
  categories: Record<CategoryId, Attempts> = {};
  skipHeight?: Height;
  hwId?: number;
  rugnr?: number;

  constructor(data: ThrowerData) {
    this.name = data.name;
    this.categories = data.categories ?? {};
    // remove empty attempt arrays
    Object.entries(this.categories).forEach(([cat, atts]) =>
      Object.keys(atts).forEach((h) => {
        if (!atts[h] || atts[h].length == 0) {
          delete atts[h];
        }
      })
    );
    this.skipHeight = data.skipHeight;
    this.hwId = data.hwId;
    this.rugnr = data.rugnr;
  }

  setSkipHeight(height: Height) {
    this.skipHeight = height;
  }

  getThrowsAtHeight(height: Height, categoryId: CategoryId) {
    return this.categories[categoryId][height] || [];
  }

  isEliminatingThrow(categoryId: CategoryId, height: Height): boolean {
    return getFailedAttemptCount(this.categories[categoryId][height]) == 3;
  }

  getHighestSuccess(categoryId: CategoryId): Height | null {
    return (
      Object.entries(this.categories[categoryId])
        .filter(([height]) => !this.isEliminatingThrow(categoryId, Number(height)))
        .map(([height]) => Number(height))
        .sort((a, b) => b - a)[0] || null
    );
  }

  getEliminatedHeight(categoryId: CategoryId): Height | null {
    return (
      Object.entries(this.categories[categoryId])
        .filter(([height]) => this.isEliminatingThrow(categoryId, Number(height)))
        .map(([height]) => Number(height))
        .sort((a, b) => a - b)[0] || null
    );
  }

  isEliminated(categoryId: CategoryId) {
    return Object.entries(this.categories[categoryId]).some(([height]) =>
      this.isEliminatingThrow(categoryId, Number(height))
    );
  }

  needsThrowAtHeight(height: Height, categoryId: CategoryId) {
    const throws: [Judge?, Judge?, Judge?] = this.getThrowsAtHeight(height, categoryId);
    return throws.length != 3 && !throws.includes('V') && (this.skipHeight == undefined || this.skipHeight < height);
  }

  judge(height: Height, judge: Judge, categoryId: CategoryId) {
    assert(this.categories[categoryId], `Thrower needs to be added to category before judges`);

    if (!this.categories[categoryId][height]) this.categories[categoryId][height] = [judge];
    else this.categories[categoryId][height].push(judge);
  }

  addToCategory(categoryId: CategoryId) {
    if (!this.categories[categoryId]) this.categories[categoryId] = {};
  }
}

type CategoryData = {
  name?: string;
  ranking?: [ThrowerId, number][];
  count?: number;
  eliminated?: number;
  remaining?: number;
};

class Category {
  name: string;
  constructor(data: CategoryData) {
    this.name = data.name;
  }
}

type MeterData = {
  name?: string;
  height?: Height;
  categories?: CategoryId[];
  throwOrder?: ThrowerId[];
};

class Meter {
  name: string;
  height: Height;
  categories: CategoryId[];

  constructor(data: MeterData) {
    this.name = data.name;
    this.height = data.height;
    this.categories = data.categories ?? [];
  }

  setHeight(height: Height): void {
    this.height = height;
  }
}

export type CompetitionData = {
  _id?: string;
  name?: string;
  throwers?: Array<ThrowerData>;
  categories?: Array<CategoryData>;
  meters?: Array<MeterData>;
};

export class Competition {
  _id?: string;
  name = '';
  throwers: Thrower[] = [];
  categories: Category[] = [];
  meters: Meter[] = [];
  legacySortLessDraws?: boolean;

  constructor(comp: CompetitionData = {}) {
    this._id = comp._id;
    this.name = comp.name;
    this.throwers = (comp.throwers ?? []).map((x) => new Thrower(x));
    this.categories = (comp.categories ?? []).map((x) => new Category(x));
    this.meters = (comp.meters ?? []).map((x) => new Meter(x));
  }

  setName(name: string) {
    this.name = name;
  }

  addThrower(data: ThrowerData): Thrower {
    data.name = data.name ?? `no name ${this.throwers.length}`;
    const thrower = new Thrower(data);
    this.throwers.push(thrower);
    return thrower;
  }
  addCategory(data: CategoryData): Category {
    data.name = data.name ?? `data ${this.categories.length}`;
    const category = new Category(data);
    this.categories.push(category);
    return category;
  }
  addMeter(data: MeterData): Meter {
    data.name = data.name ?? `data ${this.meters.length}`;
    const meter = new Meter(data);
    this.meters.push(meter);
    return meter;
  }

  setThrower(throwerId: ThrowerId, data: ThrowerData) {
    this.throwers[throwerId] = new Thrower(data);
  }

  removeMeter(meterId: MeterId): void {
    this.meters.splice(meterId, 1);
  }

  setMeterHeight(meterId: MeterId, height: Height): void {
    const meter = this.meters[meterId];
    meter.setHeight(height);
  }

  updateMeter(meterId: MeterId, meter: MeterData): void {
    this.meters[meterId] = new Meter(meter);
  }

  skipHeight(throwerId: ThrowerId, height: Height): void {
    this.throwers[throwerId].setSkipHeight(height);
  }

  createFinaleCategory(name, throwers) {
    const category = new Category({ name });
    const catId = this.categories.length;
    throwers.forEach((tid) => (this.throwers[tid].categories[catId] = {}));
    this.categories.push(category);
  }

  meterThrowOrder(meterId: MeterId): Array<ThrowerId> {
    const meter = this.meters[meterId];
    const throwers = this.throwers.filter((t) =>
      meter.categories.some(
        (cat) => t.categories[cat] && t.needsThrowAtHeight(meter.height, cat) && !t.isEliminated(cat)
      )
    );

    assert(
      throwers.every((t) => meter.categories.filter((cat) => t.categories[cat]).length == 1),
      'A thrower should only be in one of the active categories in a metric'
    );

    const getAnyThrowsInCategoryListAtHeight = (thrower: Thrower) => {
      return meter.categories.map((cat) => thrower.categories[cat]?.[meter.height]).find((x) => x);
    };

    throwers.sort((a, b) => {
      const aThrows = getAnyThrowsInCategoryListAtHeight(a);
      const bThrows = getAnyThrowsInCategoryListAtHeight(b);
      if (!aThrows && !bThrows) return 0;
      if (!aThrows) return -1;
      if (!bThrows) return 1;

      return getFailedAttemptCount(aThrows) - getFailedAttemptCount(bThrows);
    });

    return throwers.map((t) => this.throwers.indexOf(t));
  }

  judgeThrow(throwerId: ThrowerId, height: Height, judge: Judge, categoryId: CategoryId): void {
    const thrower = this.throwers[throwerId];
    thrower.judge(height, judge, categoryId);
  }

  categoryRanking(categoryId: CategoryId): Array<[ThrowerId, number]> {
    const throwers = this.throwers.filter((t) => t.categories[categoryId]);
    const eliminated = throwers.filter((t) => t.isEliminated(categoryId));

    const sortPred = (a: Thrower, b: Thrower) => {
      const aHigh = a.getHighestSuccess(categoryId);
      const bHigh = b.getHighestSuccess(categoryId);
      // both did a "Pietje"
      if (aHigh === null && bHigh === null) return 0;
      // a or b did a "Pietje"
      if (!aHigh) return 1;
      if (!bHigh) return -1;
      // height differ
      if (aHigh !== bHigh) return bHigh - aHigh;

      const aThrows = a.categories[categoryId];
      const bThrows = b.categories[categoryId];

      // merge all heights of both
      const heights = Object.keys(aThrows)
        .concat(Object.keys(bThrows))
        .map(Number)
        .filter((x, i, a) => a.indexOf(x) == i)
        .sort((a, b) => b - a);

      // find first height where attempts differ
      const res = heights
        .filter((h) => h <= aHigh)
        .map((height) => {
          if (this.legacySortLessDraws) return (aThrows[height]?.length || 0) - (bThrows[height]?.length || 0);
          return getFailedAttemptCount(aThrows[height]) - getFailedAttemptCount(bThrows[height]);
        })
        .find((x) => x != 0);
      return res || 0;
    };

    // sort and store the draws
    const draws = [];
    eliminated.sort((a, b) => {
      const res = sortPred(a, b);
      if (res !== 0) return res;
      const ai = this.throwers.indexOf(a);
      const bi = this.throwers.indexOf(b);
      if (!draws[ai]) draws[ai] = bi;
      if (!draws[bi]) draws[bi] = ai;
      return res;
    });

    return eliminated.map((t, rank) => {
      const tid = this.throwers.indexOf(t);

      // recursively finds all throwers we drawed with and gets lowest rank from it
      const visited = [];
      const getMinDraw = (tid: ThrowerId, rank: number) => {
        if (!draws[tid] || visited.includes(tid)) return rank;
        visited.push(tid);
        const dtid = draws[tid];
        const drawThrower = this.throwers[dtid];
        const drawRank = eliminated.indexOf(drawThrower);
        return Math.min(rank, getMinDraw(dtid, drawRank));
      };

      // if this has a draw, use the smallest as rank
      rank = getMinDraw(tid, rank);
      // get rank by adding the not yet eliminated count
      return [tid, rank + throwers.length - eliminated.length];
    });
  }

  toJSON(): CompetitionData {
    return {
      _id: this._id,
      name: this.name,
      throwers: this.throwers,
      categories: this.categories,
      meters: this.meters,
    };
  }

  createData() {
    const data = JSON.parse(JSON.stringify(this));
    data.meters.forEach((m: MeterData, mid: MeterId) => {
      m.throwOrder = this.meterThrowOrder(mid);
    });
    data.categories.forEach((cat: CategoryData, catId: CategoryId) => {
      cat.ranking = this.categoryRanking(catId);
      const throwers = data.throwers.filter((t) => t.categories[catId]).map((t) => new Thrower(t));

      // total throwers in this category
      cat.count = throwers.length;
      // eliminated throwers in this category
      cat.eliminated = throwers.filter((t) => t.isEliminated(catId)).length;

      // heigts throwers are eliminated
      const eliminatedHeights = throwers.map((t) => t.isEliminated(catId) && t.getEliminatedHeight(catId));
      // thrown heights of this category
      const heights = throwers
        .flatMap((t) => Object.keys(t.categories[catId]).map(Number))
        .filter((x, i, a) => a.indexOf(x) == i);

      // stats per height
      cat.stats = {};
      heights.forEach((h) => {
        cat.stats[h] = {
          count: eliminatedHeights.filter((x) => x === false || x >= h).length,
          remaining: eliminatedHeights.filter((x) => x === false || x > h).length,
        };
      });
    });

    data.throwers.forEach((t: ThrowerData, i: ThrowerId) => {
      Object.keys(t.categories).forEach((cat) => {
        // get highest successfull throw
        const heights = Object.keys(t.categories[cat])
          .filter((height) => t.categories[cat][height].includes('V'))
          .map(Number);

        const success = heights.sort((a, b) => b - a)[0];
        if (success) t.success = Number(success);

        // get eliminated value by category
        const thrower = this.throwers[i];
        t.eliminated = data.categories.map((cat, catId) => thrower.categories[catId] && thrower.isEliminated(catId));
      });
    });
    return data;
  }
}
