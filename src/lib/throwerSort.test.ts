import { Competition, ThrowerId, CategoryId, MeterId, Judge, Height } from './throwerSort';

it('add a thrower/category/meter', () => {
  const comp = new Competition();

  comp.addThrower({});
  comp.addCategory({});
  comp.addHeightMeter({});

  expect(comp.throwers.length).toBe(1);
  expect(comp.categories.length).toBe(1);
  expect(comp.meters.length).toBe(1);
});

function createSampleCompetition() {
  return new Competition({
    categories: [{ name: 'Heren 16+' }, { name: 'Dames 16+' }],
    throwers: [
      { name: 'Astrid', categories: [1] },
      { name: 'Bob', categories: [0] },
    ],
    meters: [{ name: 'nr 1', height: 8, categories: [0, 1] }],
  });
}

describe('competition', () => {
  let comp: Competition;
  beforeEach(() => (comp = createSampleCompetition()));

  const meter1 = 0;
  const astrid = 0,
    bob = 1,
    chris = 2;
  const heren = 0,
    dames = 1;

  function eliminateThrower(throwerId: ThrowerId, height: Height) {
    comp.judgeThrow(throwerId, height, 'X');
    comp.judgeThrow(throwerId, height, 'X');
    comp.judgeThrow(throwerId, height, 'X');
  }

  describe('throworder', () => {
    it('generates a throw order when no throws yet', () => {
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([astrid, bob]);
    });

    it('generates a throw order after a first success throw', () => {
      comp.judgeThrow(astrid, 8, 'V');
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([bob]);
    });

    it('generates a throw order after a first fail throw', () => {
      comp.judgeThrow(astrid, 8, 'X');
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([bob, astrid]);
    });

    it('eliminate player after 3 fails', () => {
      eliminateThrower(astrid, 8);
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([bob]);
    });

    it('can skip to a certain height', () => {
      comp.skipHeight(astrid, 8);
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([bob]);
    });

    it('recreates throw order on next height', () => {
      comp.judgeThrow(astrid, 8, 'V');
      comp.judgeThrow(bob, 8, 'V');
      comp.setMeterHeight(meter1, 8.5);
      const throwOrder = comp.meterThrowOrder(meter1);
      expect(throwOrder).toEqual([astrid, bob]);
    });
  });

  describe('standing', () => {
    beforeEach(() => comp.addThrower({ name: 'Chris', categories: [0] }));
    beforeEach(() => eliminateThrower(astrid, 8));

    it('creates empty ranking when no eliminations', () => {
      const ranking = comp.categoryRanking(heren);
      expect(ranking).toEqual([null, null]);
    });

    it('create single entry ranking on 1 elimination', () => {
      eliminateThrower(bob, 8);
      const ranking = comp.categoryRanking(heren);
      expect(ranking).toEqual([null, bob]);
    });

    it('creates ranking when all eliminated', () => {
      eliminateThrower(bob, 8);
      comp.judgeThrow(chris, 8, 'V');
      eliminateThrower(chris, 8.5);
      const ranking = comp.categoryRanking(heren);
      expect(ranking).toEqual([chris, bob]);
    });
  });
});
