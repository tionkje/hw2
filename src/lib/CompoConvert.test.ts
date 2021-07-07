import CompoConvert from './CompoConvert';

const copy = (o) => JSON.parse(JSON.stringify(o));

it('converts an empty competition', () => {
  function createEmptyOldData() {
    return {
      name: '',
      throwers: [],
      categories: {},
    };
  }
  const oldCompo = createEmptyOldData();

  const newCompo = CompoConvert(oldCompo);

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
        nr: 4,
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

  const backup = copy(oldCompo);
  const newCompo = copy(CompoConvert(oldCompo));
  expect(oldCompo).toEqual(backup);
  expect(newCompo).toEqual({
    name: 'CompetitionName',
    categories: [{ name: 'Heren' }],
    throwers: [
      {
        name: 'Piet Callebaut',
        skipHeight: 10.5,
        categories: {
          0: {
            10: ['S'],
            10.5: ['S'],
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
