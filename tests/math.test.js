const { add } = require('../src/domain/math');

test.each([
  [2, 3, 5],
  [-2, -3, -5],
  [0, 0, 0],
])('add(%i,%i) = %i', (x, y, r) => expect(add(x, y)).toBe(r));

test('rejette une entrée non numérique', () =>
  expect(() => add('2', 3)).toThrow(TypeError));
