import CompoConvert from './CompoConvert';

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
