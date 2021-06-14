interface Nameable {
  name: string;
}

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

class Thrower implements Nameable {
  name: string;
  categories: CategoryId[];
  throws: Record<Height, Judge[]>;

  constructor(data: ThrowerData) {
    this.name = data.name;
    this.categories = data.categories ?? [];
    this.throws = data.throws ?? {};
  }

  needsThrowAtHeight(height: Height) {
    const throws = this.throws[height] || [];
    return throws.length != 3 && !throws.includes('V');
  }

  judge(height: Height, judge: Judge) {
    if (!this.throws[height]) this.throws[height] = [];
    this.throws[height].push(judge);
  }
}

class Category implements Nameable {
  name: string;
}

class Meter implements Nameable {
  name: string;
  height: Height;
  categories: CategoryId[];
}

type CompetitionData = {
  throwers?: Array<ThrowerData>;
  categories?: Array<Category>;
  meters?: Array<Meter>;
};

export class Competition {
  throwers: Thrower[] = [];
  categories: Category[] = [];
  meters: Meter[] = [];

  constructor(comp: CompetitionData = {}) {
    this.throwers = (comp.throwers ?? []).map((x) => new Thrower(x));
    this.categories = comp.categories ?? [];
    this.meters = comp.meters ?? [];
  }

  addThrower(thrower: Thrower): void {
    thrower.name = thrower.name ?? `no name ${this.throwers.length}`;
    this.throwers.push(thrower);
  }
  addCategory(category: Category): void {
    category.name = category.name ?? `category ${this.categories.length}`;
    this.categories.push(category);
  }
  addHeightMeter(meter: Meter): void {
    meter.name = meter.name ?? `meter ${this.meters.length}`;
    this.meters.push(meter);
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
      // if(a.throws[meter.height] && b.throws[meter.height]) return 0;

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
