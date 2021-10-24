import { Competition, ThrowerId, CategoryId, Height } from './Competition';

it('add a thrower/category/meter', () => {
  const comp = new Competition();

  comp.addThrower({});
  comp.addCategory({});
  comp.addMeter({});

  expect(comp.throwers.length).toBe(1);
  expect(comp.categories.length).toBe(1);
  expect(comp.meters.length).toBe(1);
});

function createSampleCompetitionData() {
  return {
    name: 'TestCompetition',
    categories: [{ name: 'Heren 16+' }, { name: 'Dames 16+' }],
    throwers: [
      { name: 'Astrid', categories: { 1: {} } },
      { name: 'Bob', categories: { 0: {} } },
    ],
    meters: [{ name: 'nr 1', height: 8, categories: [0, 1] }],
  };
}

describe('competition', () => {
  let comp: Competition;
  beforeEach(() => (comp = new Competition(createSampleCompetitionData())));

  const meter1 = 0;
  const astrid = 0,
    bob = 1,
    chris = 2,
    dave = 3;
  const heren = 0,
    dames = 1;

  function eliminateThrower(throwerId: ThrowerId, height: Height, categoryid: CategoryId) {
    comp.judgeThrow(throwerId, height, 'X', categoryid);
    comp.judgeThrow(throwerId, height, 'X', categoryid);
    comp.judgeThrow(throwerId, height, 'X', categoryid);
  }

  it('has a name', () => {
    expect(comp.name).toBe('TestCompetition');
  });

  it('can Convert Compo to data', () => {
    const data = JSON.parse(JSON.stringify(comp));
    expect(data).toEqual(createSampleCompetitionData());
  });

  it('exports all data', () => {
    comp.judgeThrow(bob, 7.5, 'V', heren);
    eliminateThrower(bob, 8, heren);

    const data = comp.createData();
    expect(data).toEqual({
      name: 'TestCompetition',
      categories: [
        {
          name: 'Heren 16+',
          count: 1,
          eliminated: 1,
          heightSuggest: 8.5,
          ranking: [[bob, 0]],
          stats: {
            7.5: { count: 1, remaining: 1, inprogress: 0 },
            8: { count: 1, remaining: 0, inprogress: 0 },
          },
        },
        { name: 'Dames 16+', count: 1, eliminated: 0, ranking: [], stats: {} },
      ],
      throwers: [
        { name: 'Astrid', categories: { 1: {} }, eliminated: [undefined, false] },
        {
          name: 'Bob',
          categories: { 0: { '7.5': ['V'], '8': ['X', 'X', 'X'] } },
          success: 7.5,
          eliminated: [true, undefined],
        },
      ],
      meters: [{ name: 'nr 1', height: 8, categories: [0, 1], throwOrder: [astrid], nextHeightThrowOrder: [astrid] }],
    });
  });

  it('remove a category', () => {
    comp.removeCategory(heren);
    const newDames = dames - 1;
    expect(comp.categories[heren].name).not.toBe('Heren 16+');
    expect(Object.keys(comp.throwers[bob].categories).length).toBe(0);
    expect(Object.keys(comp.throwers[astrid].categories).length).toBe(1);
    expect(comp.meters[meter1].categories.length).toBe(1);
    expect(comp.throwers[astrid].categories[newDames]).toBeTruthy();
  });
  it('remove a thrower', () => {
    expect(comp.throwers[bob]).toBeTruthy();
    comp.removeThrower(bob);
    expect(comp.throwers[bob]).toBeFalsy();
  });
  it('remove a meter', () => {
    comp.removeMeter(meter1);
    expect(comp.meters[meter1]).toBeFalsy();
  });

  describe('throworder', () => {
    it('generates a throw order when no throws yet', () => {
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([astrid, bob]);
    });

    it('generates a throw order after a first success throw', () => {
      comp.judgeThrow(astrid, 8, 'V', dames);
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([bob]);
    });

    it('generates a throw order after a first fail throw', () => {
      comp.judgeThrow(astrid, 8, 'X', dames);
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([bob, astrid]);
    });

    it('excludes category', () => {
      comp.meters[meter1].categories = [heren];
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([bob]);
    });

    it('eliminate player after 3 fails', () => {
      eliminateThrower(astrid, 8, dames);
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([bob]);
    });

    it('eliminate player after 3 fails at next height', () => {
      eliminateThrower(astrid, 8, dames);
      comp.setMeterHeight(meter1, 8.5);
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([bob]);
    });

    it('can skip to a certain height', () => {
      comp.skipHeight(astrid, 8);
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([bob]);
    });

    it('recreates throw order on next height', () => {
      comp.judgeThrow(astrid, 8, 'V', dames);
      comp.judgeThrow(bob, 8, 'V', heren);
      comp.setMeterHeight(meter1, 8.5);
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([astrid, bob]);
    });

    it('multiple failed throws sort', () => {
      const chris = 2;
      comp.addThrower({ name: 'Chris', categories: { 0: {} } });

      comp.judgeThrow(bob, 8, 'X', heren);
      comp.judgeThrow(bob, 8, 'X', heren);
      comp.judgeThrow(chris, 8, 'X', heren);

      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([astrid, chris, bob]);
    });

    it('exclude successfully thrown', () => {
      comp.judgeThrow(astrid, 8, 'X', dames);
      comp.judgeThrow(bob, 8, 'V', heren);

      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([astrid]);
    });
  });

  describe('nextHeightThrowOrder', () => {
    it('has all throwers by default', () => {
      const nextHeight = comp.meterNextHeightThrowOrder(meter1);
      expect(nextHeight).toContain(astrid);
      expect(nextHeight).toContain(bob);
    });
    it('adds throwers already succeeded', () => {
      comp.judgeThrow(astrid, 8, 'V', dames);
      expect(comp.meterNextHeightThrowOrder(meter1)).toContain(astrid);
    });
    it('does not contain eliminated players', () => {
      eliminateThrower(astrid, 8, dames);
      expect(comp.meterNextHeightThrowOrder(meter1)).not.toContain(astrid);
    });
  });

  describe('standing', () => {
    beforeEach(() => comp.addThrower({ name: 'Chris', categories: { 0: {} } }));
    beforeEach(() => eliminateThrower(astrid, 8, dames));

    const getOrderedRanking = (category = heren) => comp.categoryRanking(category).sort(([a], [b]) => a - b);

    it('creates empty ranking when no eliminations', () => {
      expect(getOrderedRanking()).toEqual([]);
    });

    it('create single entry ranking on 1 elimination', () => {
      eliminateThrower(bob, 8, heren);

      expect(getOrderedRanking()).toEqual([[bob, 1]]);
    });

    it('creates ranking when all eliminated', () => {
      eliminateThrower(chris, 8, heren);
      comp.judgeThrow(bob, 8, 'V', heren);
      eliminateThrower(bob, 8.5, heren);

      expect(getOrderedRanking()).toEqual([
        [bob, 0],
        [chris, 1],
      ]);
    });

    it('creates ranking when all eliminated', () => {
      eliminateThrower(bob, 8, heren);
      comp.judgeThrow(chris, 8, 'V', heren);
      eliminateThrower(chris, 8.5, heren);

      expect(getOrderedRanking()).toEqual([
        [bob, 1],
        [chris, 0],
      ]);
    });

    it('support draws', () => {
      eliminateThrower(bob, 8, heren);
      eliminateThrower(chris, 8, heren);

      expect(getOrderedRanking()).toEqual([
        [bob, 0],
        [chris, 0],
      ]);
    });

    it('tripple draw', () => {
      comp.addThrower({ name: 'Dave', categories: { 0: {} } });

      eliminateThrower(bob, 8, heren);
      eliminateThrower(chris, 8, heren);
      eliminateThrower(dave, 8, heren);

      expect(getOrderedRanking()).toEqual([
        [bob, 0],
        [chris, 0],
        [dave, 0],
      ]);
    });

    it('less fails ranks higher', () => {
      comp.judgeThrow(chris, 7, 'V', heren);
      comp.judgeThrow(bob, 7, 'V', heren);
      comp.judgeThrow(bob, 8, 'X', heren);
      comp.judgeThrow(bob, 8, 'V', heren);
      comp.judgeThrow(chris, 8, 'V', heren);

      eliminateThrower(bob, 8.5, heren);
      eliminateThrower(chris, 8.5, heren);

      expect(getOrderedRanking()).toEqual([
        [bob, 1],
        [chris, 0],
      ]);
    });

    it('skipped Heights', () => {
      comp.judgeThrow(bob, 7, 'X', heren);
      comp.judgeThrow(bob, 7, 'V', heren);
      comp.judgeThrow(chris, 7, 'V', heren);
      comp.judgeThrow(bob, 8, 'X', heren);
      comp.judgeThrow(bob, 8, 'V', heren);
      comp.judgeThrow(chris, 8, 'V', heren);

      eliminateThrower(bob, 8.5, heren);
      eliminateThrower(chris, 9, heren);

      expect(getOrderedRanking()).toEqual([
        [bob, 1],
        [chris, 0],
      ]);
    });

    it('rank height differ', () => {
      comp.judgeThrow(bob, 7, 'V', heren);
      eliminateThrower(bob, 8, heren);

      comp.judgeThrow(chris, 7, 'V', heren);
      comp.judgeThrow(chris, 8, 'V', heren);
      eliminateThrower(chris, 8.5, heren);

      expect(getOrderedRanking()).toEqual([
        [bob, 1],
        [chris, 0],
      ]);
    });

    it('rank with skipped heights', () => {
      comp.judgeThrow(bob, 7, 'V', heren);
      comp.judgeThrow(bob, 8, 'V', heren);
      eliminateThrower(bob, 8.5, heren);
      comp.judgeThrow(chris, 8, 'V', heren);
      eliminateThrower(chris, 8.5, heren);
      expect(getOrderedRanking()).toEqual([
        [bob, 0],
        [chris, 0],
      ]);
    });
  });

  describe('finales', () => {
    function CreateFinaleCategory() {
      comp.addThrower({ name: 'Chris' });
      comp.addCategory({ name: 'Heren 16+ Finale' });

      comp.throwers[chris].addToCategory(herenFinale);
      comp.throwers[bob].addToCategory(herenFinale);

      comp.setMeterHeight(meter1, 10);
      comp.meters[meter1].categories = [herenFinale];
    }

    const chris = 2;
    const herenFinale = 2;
    const getThrowOrder = () => comp.meterThrowOrder(meter1);

    it('can judge a finale throw', () => {
      CreateFinaleCategory();
      comp.judgeThrow(bob, 10, 'X', herenFinale);
      expect(getThrowOrder()).toEqual([chris, bob]);
    });

    it('can create a finale category from a list of throwers', () => {
      comp.addThrower({ name: 'Chris' });

      comp.createFinaleCategory('Heren 16+ Finale', [bob, chris]);
      comp.setMeterHeight(meter1, 10);
      comp.meters[meter1].categories = [herenFinale];

      expect(comp.categories.length).toBe(3);
      expect(comp.throwers[bob].categories[herenFinale]).toBeTruthy();
    });
  });

  describe('stats', () => {
    beforeEach(() => comp.addThrower({ name: 'Chris', categories: { 0: {} } }));

    it('adds thrower count and eliminated to categories', () => {
      eliminateThrower(bob, 8, heren);
      const data = comp.createData();
      expect(data.categories[heren].count).toBe(2);
      expect(data.categories[dames].count).toBe(1);
      expect(data.categories[heren].eliminated).toBe(1);
      expect(data.categories[dames].eliminated).toBe(0);
    });

    it('Add stats for each height', () => {
      comp.judgeThrow(bob, 7, 'V', heren);
      comp.judgeThrow(chris, 7, 'V', heren);
      comp.judgeThrow(bob, 7.5, 'V', heren);
      comp.judgeThrow(astrid, 7, 'V', dames);
      eliminateThrower(bob, 8, heren);
      comp.judgeThrow(chris, 8, 'V', heren);
      comp.judgeThrow(chris, 8.5, 'V', heren);
      eliminateThrower(chris, 9, heren);
      const data = comp.createData();
      expect(data.categories[heren].stats).toEqual({
        7: { count: 2, remaining: 2, inprogress: 0 },
        7.5: { count: 2, remaining: 2, inprogress: 0 },
        8: { count: 2, remaining: 1, inprogress: 0 },
        8.5: { count: 1, remaining: 1, inprogress: 0 },
        9: { count: 1, remaining: 0, inprogress: 0 },
      });
      expect(data.categories[dames].stats).toEqual({
        7: { count: 1, remaining: 1, inprogress: 0 },
      });
    });

    it('counts throwers still needing to throw', () => {
      comp.judgeThrow(bob, 7, 'V', heren);
      comp.judgeThrow(chris, 7, 'X', heren);
      expect(comp.createData().categories[heren].stats).toEqual({
        7: { count: 2, remaining: 2, inprogress: 1 },
      });
    });

    it('skipped height dont count as inprogress', () => {
      comp.judgeThrow(bob, 7, 'V', heren);
      comp.skipHeight(chris, 7);
      expect(comp.createData().categories[heren].stats).toEqual({
        7: { count: 2, remaining: 2, inprogress: 0 },
      });
    });
  });
});
