import { Competition } from './throwerSort';

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

describe('throworder', () => {
  let comp: Competition;
  beforeEach(() => (comp = createSampleCompetition()));

  it('generates a throw order when no throws yet', () => {
    const throwOrder = comp.meterThrowOrder(0);
    expect(throwOrder).toEqual([0, 1]);
  });

  it('generates a throw order after a first throw', () => {
    comp.judgeThrow(0, 0, 'V');
    const throwOrder = comp.meterThrowOrder(0);
    expect(throwOrder).toEqual([1]);
  });
});
