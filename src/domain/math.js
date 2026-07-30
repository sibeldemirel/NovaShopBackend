function add(x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new TypeError('add() attend deux nombres');
  }
  return x + y;
}

module.exports = { add };
