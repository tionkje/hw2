import CompoConvert from './CompoConvert';
import { promises as fs } from 'fs';

const copy = (o) => JSON.parse(JSON.stringify(o));

function convertAndEnsureNoChanges(compo) {
  const backup = copy(compo);
  const newCompo = CompoConvert(compo);
  expect(compo).toEqual(backup);
  return newCompo;
}

it('converts an empty competition', () => {
  function createEmptyOldData() {
    return {
      name: '',
      throwers: [],
      categories: {},
    };
  }
  const oldCompo = createEmptyOldData();

  // create copy here to create object instead of class
  const newCompo = copy(CompoConvert(oldCompo));

  expect(oldCompo).toEqual(createEmptyOldData());
  expect(newCompo).toEqual({ categories: [], meters: [], name: '', throwers: [] });
});

it('converts a competition', () => {
  const oldCompo = {
    name: 'CompetitionName',
    throwers: [
      {
        categoryid: 'Heren',
        startHeight: 10,
        hwId: 2,
        name: 'Piet Callebaut',
        nr: 1,
        rugnr: 55,
        attempts: {
          10: ['S'],
          10.5: ['S'],
          11: ['X', 'V'],
          11.5: ['V'],
          12: ['X', 'X', 'X'],
        },
        finaleGrant: [12],
        eliminated: 12.9,
        rankNr: 2,
      },
    ],
    categories: {
      Heren: {
        name: 'Heren',
        id: 'Heren',
        startHeight: 5,
      },
    },
  };

  const newCompo = convertAndEnsureNoChanges(oldCompo);
  expect(newCompo).toEqual({
    name: 'CompetitionName',
    categories: [{ name: 'Heren' }],
    throwers: [
      {
        name: 'Piet Callebaut',
        skipHeight: 10.5,
        categories: {
          0: {
            11: ['X', 'V'],
            11.5: ['V'],
            12: ['X', 'X', 'X'],
          },
        },
      },
    ],
    meters: [],
  });
});

describe('from file', () => {
  ['wk2019', 'wk2018', 'wk2017'].forEach((wkName) => {
    let oldCompo, newCompo;
    const oldFileName = `./wedstrijdData/${wkName}.json`;
    const newFileName = `./wedstrijdData/new_${wkName}.json`;

    beforeEach(async () => {
      oldCompo = JSON.parse(await fs.readFile(oldFileName, 'utf-8'));

      newCompo = convertAndEnsureNoChanges(oldCompo);
      newCompo.legacySortLessDraws = true;

      // write new to disk if changed
      const old = await fs.readFile(newFileName, 'utf8').catch(() => {
        console.log('creating', newFileName);
      });
      const n = JSON.stringify(newCompo, null, 2);
      if (old !== n) await fs.writeFile(newFileName, n);
    });

    ['Heren', 'Dames', 'Beloften Jongens', 'Beloften Meisjes'].forEach((catName) => {
      it(`${wkName} ${catName} correct ranking`, async () => {
        const heren = newCompo.categories.findIndex((c) => c.name == catName);
        expect(newCompo.categoryRanking(heren).map(([nr, rank]) => [nr, rank, newCompo.throwers[nr].name])).toEqual(
          oldCompo.throwers
            .sort((a, b) => a.rankNr - b.rankNr)
            .filter((t) => t.categoryid == catName)
            .map((t) => [t.nr - 1, t.rankNr - 1, t.name])
        );
      });
    });
  });
});
