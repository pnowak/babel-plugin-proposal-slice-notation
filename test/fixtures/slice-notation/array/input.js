const arr = ['a', 'b', 'c', 'd'];

const defaultStart = arr[:3:1];

expect(defaultStart).toBe(['a', 'b', 'c']);

const defaultEnd = arr[1::1];

expect(defaultEnd).toBe(['b', 'c', 'd']);

const defaultStep = arr[1:1:];

expect(defaultStep).toBe(['b', 'c', 'd']);

const without1 = arr[:];

expect(without1).toBe(['a', 'b', 'c', 'd']);

const without2 = arr[::];

expect(without2).toBe(['a', 'b', 'c', 'd']);

const negativeStart = arr[-2:];

expect(negativeStart).toBe(['c', 'd']);

const negativeEnd = arr[:-2];

expect(negativeEnd).toBe(['a', 'b']);

const negativeStep = arr[::-1];

expect(negativeStep).toBe(['d', 'c', 'b', 'a']);

const outStart = arr[100:];

expect(outStart).toBe([]);

const outEnd = arr[:100];

expect(outEnd).toBe(['a', 'b', 'c', 'd']);
