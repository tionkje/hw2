import { strict as assert } from 'assert';

export type ThrowerId = number;
export type CategoryId = number;
export type MeterId = number;
export type Height = number;
export type Judge = 'X' | 'V';

type ThrowerData = {
  name?: string;
  categories?: Record<CategoryId, Record<Height, Judge[]>>;
  // categories?: CategoryId[];
  // throws?: Record<Height, Judge[]>;
  skipHeight?: Height;
  rank?: number;
};

class Thrower {
  name: string;
  // categories: CategoryId[];
  categories: Record<CategoryId, Record<Height, Judge[]>> = {};
  // throws: Record<Height, Judge[]>;
  skipHeight?: Height;

  constructor(data: ThrowerData) {
    this.name = data.name;
    this.categories = data.categories ?? {};
    // this.throws = data.throws ?? {};
    this.skipHeight = data.skipHeight;
  }

  setSkipHeight(height: Height) {
    this.skipHeight = height;
  }

  defaultCategory(): CategoryId | null {
    const cat = Object.keys(this.categories)[0];
    if (cat == undefined) return null;
    return Number(cat);
  }

  getThrowsAtHeight(height: Height, categoryId: CategoryId = this.defaultCategory()) {
    return this.categories[categoryId][height] || [];
  }

  isEliminatingThrow(throws: Array<Judge>): boolean {
    return throws.filter((j) => j == 'X').length == 3;
  }

  getHighestSuccess(categoryId: CategoryId = this.defaultCategory()): Height | null {
    return (
      Object.entries(this.categories[categoryId])
        .filter(([height, throws]) => !this.isEliminatingThrow(throws))
        .map(([height, throws]) => Number(height))
        .sort((a, b) => b - a)[0] || null
    );
  }

  isEliminated(categoryId: CategoryId = this.defaultCategory()) {
    return Object.entries(this.categories[categoryId]).some(([height, throws]) => this.isEliminatingThrow(throws));
  }

  needsThrowAtHeight(height: Height, categoryId: CategoryId = this.defaultCategory()) {
    const throws = this.getThrowsAtHeight(height, categoryId);
    return throws.length != 3 && !throws.includes('V') && (this.skipHeight == undefined || this.skipHeight < height);
  }

  judge(height: Height, judge: Judge, categoryId: CategoryId = this.defaultCategory()) {
    if (!this.categories[categoryId][height]) this.categories[categoryId][height] = [];
    this.categories[categoryId][height].push(judge);
  }
}

type CategoryData = {
  name?: string;
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
};

class Meter {
  name: string;
  height: Height;
  categories: CategoryId[];

  constructor(data: MeterData) {
    this.name = data.name;
    this.height = data.height;
    this.categories = data.categories;
  }

  setHeight(height: Height): void {
    this.height = height;
  }
}

export type CompetitionData = {
  name?: string;
  throwers?: Array<ThrowerData>;
  categories?: Array<CategoryData>;
  meters?: Array<MeterData>;
};

export class Competition {
  name = '';
  throwers: Thrower[] = [];
  categories: Category[] = [];
  meters: Meter[] = [];

  constructor(comp: CompetitionData = {}) {
    this.name = comp.name;
    this.throwers = (comp.throwers ?? []).map((x) => new Thrower(x));
    this.categories = (comp.categories ?? []).map((x) => new Category(x));
    this.meters = (comp.meters ?? []).map((x) => new Meter(x));
  }

  toJSON(): CompetitionData {
    return {
      name: this.name,
      throwers: this.throwers,
      categories: this.categories,
      meters: this.meters,
    };
  }

  addThrower(data: ThrowerData): void {
    data.name = data.name ?? `no name ${this.throwers.length}`;
    const thrower = new Thrower(data);
    this.throwers.push(thrower);
  }
  addCategory(data: CategoryData): void {
    data.name = data.name ?? `data ${this.categories.length}`;
    const category = new Category(data);
    this.categories.push(category);
  }
  addHeightMeter(data: MeterData): void {
    data.name = data.name ?? `data ${this.meters.length}`;
    const meter = new Meter(data);
    this.meters.push(meter);
  }

  skipHeight(throwerId: ThrowerId, height: Height): void {
    this.throwers[throwerId].setSkipHeight(height);
  }

  setMeterHeight(meterId: MeterId, height: Height): void {
    const meter = this.meters[meterId];
    meter.setHeight(height);
  }

  meterThrowOrder(meterId: MeterId): Array<ThrowerId> {
    const meter = this.meters[meterId];
    const throwers = this.throwers.filter(
      // (t) => t.categories.some((catId) => meter.categories.includes(catId)) && t.needsThrowAtHeight(meter.height)
      (t) => meter.categories.some((cat) => t.categories[cat] && t.needsThrowAtHeight(meter.height, cat))
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

      return 0;
    });

    return throwers.map((t) => this.throwers.indexOf(t));
  }

  judgeThrow(throwerId: ThrowerId, height: Height, judge: Judge, categoryId?: CategoryId): void {
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
          return aThrows[height].filter((x) => x == 'X').length - bThrows[height].filter((x) => x == 'X').length;
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
      // if this has a draw, use the smallest as rank
      if (draws[tid]) rank = Math.min(rank, eliminated.indexOf(this.throwers[draws[tid]]));
      // get rank by adding the not yet eliminated count
      return [tid, rank + throwers.length - eliminated.length];
    });
  }
}
