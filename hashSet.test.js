import { HashSet } from './hashSet.js';

// Same sample data as the HashMap assignment, but only the keys.
// 12 keys = load level of 0.75 with the default capacity (16).
const data = [
  'apple', 'banana', 'carrot', 'dog', 'elephant', 'frog',
  'grape', 'hat', 'ice cream', 'jacket', 'kite', 'lion',
];

function createFullSet() {
  const set = HashSet();
  for (const key of data) set.set(key);
  return set;
}

// Index of the bucket where a key ends up (checked in a fresh, empty set).
function bucketIndexOf(key, capacity = 16) {
  const fresh = HashSet(capacity);
  fresh.set(key);
  return fresh.buckets.findIndex((list) => list.headNode !== null);
}

// Looks for `count` different keys that end up in the same bucket.
function findCollidingKeys(count = 2, capacity = 16) {
  const groups = {};
  for (let i = 0; i < 5000; i++) {
    const key = `key${i}`;
    const index = bucketIndexOf(key, capacity);
    groups[index] = groups[index] || [];
    groups[index].push(key);
    if (groups[index].length === count) return groups[index];
  }
  throw new Error('Could not find colliding keys');
}

// Largest number of nodes that a single bucket holds.
function longestChain(set) {
  return Math.max(...set.buckets.map((list) => list.size()));
}


// Properties
describe('HashSet properties', () => {
  test('uses a capacity of 16 and a load factor of 0.75 by default', () => {
    const set = HashSet();
    expect(set.capacity).toBe(16);
    expect(set.loadFactor).toBe(0.75);
  });

  test('creates one bucket per unit of capacity', () => {
    expect(HashSet().buckets).toHaveLength(16);
  });

  test('accepts a custom capacity and load factor', () => {
    const set = HashSet(8, 0.5);
    expect(set.capacity).toBe(8);
    expect(set.loadFactor).toBe(0.5);
    expect(set.buckets).toHaveLength(8);
  });

  test('capacity always reflects the current capacity after growing', () => {
    const set = createFullSet();
    expect(set.capacity).toBe(16);
    set.set('moon');
    expect(set.capacity).toBe(32);
  });

  test('buckets always reflect the current buckets after growing', () => {
    const set = createFullSet();
    const bucketsBeforeGrowing = set.buckets;

    set.set('moon');

    expect(set.buckets).not.toBe(bucketsBeforeGrowing);
    expect(set.buckets).toHaveLength(32);
    // 13 keys must be stored in the buckets that the set shows.
    const stored = set.buckets.reduce((total, list) => total + list.size(), 0);
    expect(stored).toBe(13);
  });

  test('buckets always reflect the current buckets after clearing', () => {
    const set = createFullSet();
    set.clear();
    expect(set.buckets.every((list) => list.headNode === null)).toBe(true);
  });

  test('capacity and buckets are read-only views of the internal map', () => {
    const set = HashSet();
    try {
      set.capacity = 999;
    } catch {
      // In strict mode assigning to a getter-only property throws; that is fine.
    }
    expect(set.capacity).toBe(16);
  });
});


// set(key)
describe('set(key)', () => {
  test('stores a new key', () => {
    const set = HashSet();
    set.set('apple');
    expect(set.has('apple')).toBe(true);
    expect(set.length()).toBe(1);
  });

  test('places the key in a bucket', () => {
    const set = HashSet();
    set.set('apple');
    const stored = set.buckets.reduce((total, list) => total + list.size(), 0);
    expect(stored).toBe(1);
  });

  test('adding the same key again does not duplicate it', () => {
    const set = HashSet();
    set.set('dog');
    set.set('dog');
    set.set('dog');
    expect(set.length()).toBe(1);
    expect(set.keys()).toEqual(['dog']);
  });

  test('adding the same key again does not add nodes to its bucket', () => {
    const set = HashSet();
    set.set('dog');
    set.set('dog');
    expect(longestChain(set)).toBe(1);
  });

  test('ignores any extra argument: only the key is stored', () => {
    const set = HashSet();
    set.set('dog', 'brown');
    expect(set.has('dog')).toBe(true);
    expect(set.keys()).toEqual(['dog']);
    expect(set.length()).toBe(1);
  });

  test('a collision is not a duplicate: both keys are kept', () => {
    const set = HashSet();
    const [keyA, keyB] = findCollidingKeys();
    set.set(keyA);
    set.set(keyB);

    expect(set.has(keyA)).toBe(true);
    expect(set.has(keyB)).toBe(true);
    expect(set.length()).toBe(2);
    expect(longestChain(set)).toBe(2);
  });

  test('keeps every key of a longer collision chain', () => {
    const set = HashSet();
    const colliding = findCollidingKeys(3);
    colliding.forEach((key) => set.set(key));
    expect(set.keys().sort()).toEqual([...colliding].sort());
    expect(set.length()).toBe(3);
  });

  test('can store the empty string as a key', () => {
    const set = HashSet();
    set.set('');
    expect(set.has('')).toBe(true);
    expect(set.length()).toBe(1);
  });

  test('is case sensitive', () => {
    const set = HashSet();
    set.set('apple');
    set.set('Apple');
    expect(set.length()).toBe(2);
    expect(set.has('APPLE')).toBe(false);
  });

  test('does not grow while the load level is at or below the load factor', () => {
    const set = createFullSet(); // 12 / 16 = 0.75
    expect(set.length()).toBe(12);
    expect(set.capacity).toBe(16);
    expect(set.buckets).toHaveLength(16);
  });

  test('adding repeated keys to a full set does not make it grow', () => {
    const set = createFullSet();
    set.set('apple');
    set.set('hat');
    set.set('lion');
    expect(set.length()).toBe(12);
    expect(set.capacity).toBe(16);
  });
});


// Growth (load factor)
describe('growth when exceeding the load factor', () => {
  test('doubles the capacity when a new key exceeds the load factor', () => {
    const set = createFullSet();
    set.set('moon');
    expect(set.capacity).toBe(32);
    expect(set.buckets).toHaveLength(32);
    expect(set.length()).toBe(13);
  });

  test('the load level drops below the load factor after growing', () => {
    const set = createFullSet();
    set.set('moon');
    expect(set.length() / set.capacity).toBeLessThan(set.loadFactor);
  });

  test('keeps every key reachable after growing', () => {
    const set = createFullSet();
    set.set('moon');
    for (const key of data) expect(set.has(key)).toBe(true);
    expect(set.has('moon')).toBe(true);
  });

  test('spreads the keys among the expanded buckets', () => {
    const set = createFullSet();
    set.set('moon');
    const usedBuckets = set.buckets.filter((list) => list.size() > 0).length;
    expect(usedBuckets).toBeGreaterThanOrEqual(8);
    expect(longestChain(set)).toBeLessThanOrEqual(4);
  });

  test('adding repeated keys after growing changes nothing', () => {
    const set = createFullSet();
    set.set('moon');
    set.set('apple');
    set.set('moon');
    expect(set.length()).toBe(13);
    expect(set.capacity).toBe(32);
  });

  test('keeps growing as needed (16 -> 32 -> 64 -> ...)', () => {
    const set = HashSet();
    const total = 100;
    for (let i = 0; i < total; i++) set.set(`key-${i}`);

    expect(set.length()).toBe(total);
    expect(set.length() / set.capacity).toBeLessThanOrEqual(set.loadFactor);
    expect(set.buckets).toHaveLength(set.capacity);
    expect(Math.log2(set.capacity / 16) % 1).toBe(0);
    for (let i = 0; i < total; i++) expect(set.has(`key-${i}`)).toBe(true);
  });

  test('respects a custom capacity and load factor', () => {
    const set = HashSet(4, 0.5); // grows when it has more than 2 keys
    set.set('a');
    set.set('b');
    expect(set.capacity).toBe(4);
    set.set('c');
    expect(set.capacity).toBe(8);
    expect(set.length()).toBe(3);
  });

  test('the other methods keep working after growing', () => {
    const set = createFullSet();
    set.set('moon');

    expect(set.remove('moon')).toBe(true);
    expect(set.has('moon')).toBe(false);
    expect(set.length()).toBe(12);
    expect(set.keys()).toHaveLength(12);

    set.clear();
    expect(set.length()).toBe(0);
  });
});


// has(key)
describe('has(key)', () => {
  test('returns true for existing keys', () => {
    const set = createFullSet();
    for (const key of data) expect(set.has(key)).toBe(true);
  });

  test('returns false for missing keys', () => {
    expect(createFullSet().has('cat')).toBe(false);
  });

  test('returns false on an empty set', () => {
    expect(HashSet().has('apple')).toBe(false);
  });

  test('returns a real boolean', () => {
    const set = createFullSet();
    expect(set.has('dog')).toBe(true);
    expect(set.has('cat')).toBe(false);
    expect(typeof set.has('dog')).toBe('boolean');
  });

  test('returns false for a key that only collides with a stored one', () => {
    const set = HashSet();
    const [stored, other] = findCollidingKeys();
    set.set(stored);
    expect(set.has(stored)).toBe(true);
    expect(set.has(other)).toBe(false);
  });

  test('returns false after the key is removed', () => {
    const set = createFullSet();
    set.remove('kite');
    expect(set.has('kite')).toBe(false);
  });
});


// remove(key)
describe('remove(key)', () => {
  test('returns true and removes the key if it exists', () => {
    const set = createFullSet();
    expect(set.remove('kite')).toBe(true);
    expect(set.has('kite')).toBe(false);
  });

  test('returns false if the key does not exist', () => {
    const set = createFullSet();
    expect(set.remove('cat')).toBe(false);
    expect(set.length()).toBe(12);
  });

  test('returns false on an empty set', () => {
    expect(HashSet().remove('apple')).toBe(false);
  });

  test('returns false the second time the same key is removed', () => {
    const set = createFullSet();
    expect(set.remove('dog')).toBe(true);
    expect(set.remove('dog')).toBe(false);
  });

  test('decreases the length by one', () => {
    const set = createFullSet();
    set.remove('lion');
    expect(set.length()).toBe(11);
  });

  test('does not affect the other keys', () => {
    const set = createFullSet();
    set.remove('hat');
    for (const key of data) {
      if (key !== 'hat') expect(set.has(key)).toBe(true);
    }
  });

  test('removes the first, a middle and the last node of a collision chain', () => {
    const set = HashSet();
    const [a, b, c, d] = findCollidingKeys(4);
    [a, b, c, d].forEach((key) => set.set(key));

    expect(set.remove(a)).toBe(true); // head
    expect(set.remove(c)).toBe(true); // middle
    expect(set.remove(d)).toBe(true); // tail

    expect(set.has(a)).toBe(false);
    expect(set.has(c)).toBe(false);
    expect(set.has(d)).toBe(false);
    expect(set.has(b)).toBe(true);
    expect(set.length()).toBe(1);
  });

  test('returns false for a key that only collides with a stored one', () => {
    const set = HashSet();
    const [stored, other] = findCollidingKeys();
    set.set(stored);
    expect(set.remove(other)).toBe(false);
    expect(set.has(stored)).toBe(true);
  });

  test('allows adding the key again after removing it', () => {
    const set = HashSet();
    set.set('dog');
    set.remove('dog');
    set.set('dog');
    expect(set.has('dog')).toBe(true);
    expect(set.length()).toBe(1);
  });

  test('can empty the whole set one key at a time', () => {
    const set = createFullSet();
    for (const key of data) expect(set.remove(key)).toBe(true);
    expect(set.length()).toBe(0);
    expect(set.keys()).toEqual([]);
  });
});


// length()
describe('length()', () => {
  test('is 0 for a new set', () => {
    expect(HashSet().length()).toBe(0);
  });

  test('counts the stored keys', () => {
    const set = HashSet();
    set.set('apple');
    expect(set.length()).toBe(1);
    set.set('banana');
    expect(set.length()).toBe(2);
  });

  test('counts all the keys of the assignment data', () => {
    expect(createFullSet().length()).toBe(12);
  });

  test('counts keys that collide in the same bucket', () => {
    const set = HashSet();
    findCollidingKeys(3).forEach((key) => set.set(key));
    expect(set.length()).toBe(3);
  });

  test('does not change when a key is added again', () => {
    const set = createFullSet();
    set.set('apple');
    expect(set.length()).toBe(12);
  });

  test('counts a key that is the empty string', () => {
    const set = HashSet();
    set.set('');
    set.set('a');
    expect(set.length()).toBe(2);
  });

  test('is 13 after adding "moon" to the assignment data', () => {
    const set = createFullSet();
    set.set('moon');
    expect(set.length()).toBe(13);
  });
});


// clear()
describe('clear()', () => {
  test('removes all the keys', () => {
    const set = createFullSet();
    set.clear();
    expect(set.length()).toBe(0);
    expect(set.keys()).toEqual([]);
  });

  test('previous keys are no longer found', () => {
    const set = createFullSet();
    set.clear();
    for (const key of data) expect(set.has(key)).toBe(false);
  });

  test('keeps one empty bucket per unit of capacity', () => {
    const set = createFullSet();
    set.clear();
    expect(set.buckets).toHaveLength(set.capacity);
    expect(set.buckets.every((list) => list.headNode === null)).toBe(true);
  });

  test('keeps the grown capacity (does not go back to 16)', () => {
    const set = createFullSet();
    set.set('moon');
    set.clear();
    expect(set.capacity).toBe(32);
    expect(set.buckets).toHaveLength(32);
  });

  test('works on an empty set', () => {
    const set = HashSet();
    expect(() => set.clear()).not.toThrow();
    expect(set.length()).toBe(0);
  });

  test('the set can be used again after clearing it', () => {
    const set = createFullSet();
    set.clear();
    set.set('apple');
    expect(set.has('apple')).toBe(true);
    expect(set.length()).toBe(1);
  });
});


// keys()
describe('keys()', () => {
  test('returns an empty array for an empty set', () => {
    expect(HashSet().keys()).toEqual([]);
  });

  test('returns all the keys', () => {
    expect(createFullSet().keys().sort()).toEqual([...data].sort());
  });

  test('returns only keys: the internal fixed value is never exposed', () => {
    const keys = createFullSet().keys();
    expect(keys.every((key) => typeof key === 'string')).toBe(true);
    expect(keys).not.toContain(true);
  });

  test('has no duplicates after adding repeated keys', () => {
    const set = createFullSet();
    set.set('apple');
    set.set('dog');
    const keys = set.keys();
    expect(keys).toHaveLength(12);
    expect(new Set(keys).size).toBe(12);
  });

  test('includes keys that collide in the same bucket', () => {
    const set = HashSet();
    const colliding = findCollidingKeys(3);
    colliding.forEach((key) => set.set(key));
    expect(set.keys().sort()).toEqual([...colliding].sort());
  });

  test('reflects removals', () => {
    const set = createFullSet();
    set.remove('apple');
    expect(set.keys()).not.toContain('apple');
    expect(set.keys()).toHaveLength(11);
  });

  test('returns all the keys after growing', () => {
    const set = createFullSet();
    set.set('moon');
    expect(set.keys().sort()).toEqual([...data, 'moon'].sort());
  });

  test('returns a new array each time', () => {
    const set = createFullSet();
    const first = set.keys();
    first.push('hacked');
    expect(set.keys()).not.toContain('hacked');
  });
});


// Full scenario (same flow as the HashMap assignment, but with keys only)
describe('assignment scenario', () => {
  test('follows the same steps as the HashMap test, with keys only', () => {
    const test = HashSet();

    // Populate: load level is exactly 0.75.
    for (const key of data) test.set(key);
    expect(test.length() / test.capacity).toBe(0.75);

    // Adding existing keys with a full set: nothing is added, nothing grows.
    test.set('apple');
    test.set('hat');
    expect(test.length()).toBe(12);
    expect(test.capacity).toBe(16);

    // Exceed the load factor: capacity doubles.
    test.set('sun');
    expect(test.capacity).toBe(32);
    expect(test.length()).toBe(13);
    expect(test.length() / test.capacity).toBeLessThan(0.75);

    test.set('moon');
    test.set('stars');
    expect(test.length()).toBe(15);
    expect(test.buckets).toHaveLength(32);

    // The rest of the methods after growing.
    expect(test.has('moon')).toBe(true);
    expect(test.has('cat')).toBe(false);
    expect(test.remove('kite')).toBe(true);
    expect(test.remove('kite')).toBe(false);
    expect(test.length()).toBe(14);
    expect(test.keys()).toHaveLength(14);

    test.clear();
    expect(test.length()).toBe(0);
    expect(test.keys()).toEqual([]);
  });
});