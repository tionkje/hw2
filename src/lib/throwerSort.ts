type ThrowerId = number;
type CategoryId = number;
type MeterId = number;
type Height = number;
type Judge = 'X' | 'V';

type ThrowerData = {
  name?: string;
  categories?: CategoryId[];
  throws?: Record<Height, Judge[]>;
};

class Thrower {
  name: string;
  categories: CategoryId[];
  throws: Record<Height, Judge[]>;
  skipHeight?: Height;

  constructor(data: ThrowerData) {
    this.name = data.name;
    this.categories = data.categories ?? [];
    this.throws = data.throws ?? {};
  }

  setSkipHeight(height: Height) {
    this.skipHeight = height;
  }

  getThrowsAtHeight(height: Height) {
    return this.throws[height] || [];
  }

  needsThrowAtHeight(height: Height) {
    const throws = this.getThrowsAtHeight(height);
    return throws.length != 3 && !throws.includes('V') && (this.skipHeight == undefined || this.skipHeight < height);
  }

  judge(height: Height, judge: Judge) {
    if (!this.throws[height]) this.throws[height] = [];
    this.throws[height].push(judge);
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
}

type CompetitionData = {
  throwers?: Array<ThrowerData>;
  categories?: Array<CategoryData>;
  meters?: Array<MeterData>;
};

export class Competition {
  throwers: Thrower[] = [];
  categories: Category[] = [];
  meters: Meter[] = [];

  constructor(comp: CompetitionData = {}) {
    this.throwers = (comp.throwers ?? []).map((x) => new Thrower(x));
    this.categories = (comp.categories ?? []).map((x) => new Category(x));
    this.meters = (comp.meters ?? []).map((x) => new Meter(x));
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

  meterThrowOrder(meterId: MeterId): Array<ThrowerId> {
    const meter = this.meters[meterId];
    const throwers = this.throwers.filter(
      (t) => t.categories.some((catId) => meter.categories.includes(catId)) && t.needsThrowAtHeight(meter.height)
    );

    throwers.sort((a, b) => {
      const aThrows = a.throws[meter.height];
      const bThrows = b.throws[meter.height];
      if (!aThrows && !bThrows) return 0;
      if (!aThrows) return -1;
      if (!bThrows) return 1;

      return 0;
    });

    return throwers.map((t) => this.throwers.indexOf(t));
  }

  judgeThrow(meterId: MeterId, throwerId: ThrowerId, judge: Judge): void {
    const meter = this.meters[meterId];
    const thrower = this.throwers[throwerId];
    thrower.judge(meter.height, judge);
  }
}
