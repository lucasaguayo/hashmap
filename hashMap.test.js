import { HashMap } from './hashMap.js';

// Data from The Odin Project assignment (12 entries = load level of 0.75).
const data = [
  ['apple', 'red'],
  ['banana', 'yellow'],
  ['carrot', 'orange'],
  ['dog', 'brown'],
  ['elephant', 'gray'],
  ['frog', 'green'],
  ['grape', 'purple'],
  ['hat', 'black'],
  ['ice cream', 'white'],
  ['jacket', 'blue'],
  ['kite', 'pink'],
  ['lion', 'golden'],
];

function createFullMap() {
  const map = HashMap();
  for (const [key, value] of data) map.set(key, value);
  return map;
}

// Sorts [key, value] pairs by key, because a hash map does not guarantee order.
function sortEntries(entries) {
  return [...entries].sort((a, b) => a[0].localeCompare(b[0]));
}

// Looks for `count` different keys that end up in the same bucket.
function findCollidingKeys(map, count = 2) {
  const groups = {};
  for (let i = 0; i < 5000; i++) {
    const key = `key${i}`;
    const index = map.hash(key);
    groups[index] = groups[index] || [];
    groups[index].push(key);
    if (groups[index].length === count) return groups[index];
  }
  throw new Error('Could not find colliding keys');
}

// Largest number of nodes that a single bucket holds.
function longestChain(map) {
  return Math.max(...map.buckets.map((list) => list.size()));
}


// Properties
describe('HashMap properties', () => {
  test('uses a capacity of 16 and a load factor of 0.75 by default', () => {
    const map = HashMap();
    expect(map.capacity).toBe(16);
    expect(map.loadFactor).toBe(0.75);
  });

  test('creates one bucket per unit of capacity', () => {
    const map = HashMap();
    expect(map.buckets).toHaveLength(16);
  });

  test('accepts a custom capacity and load factor', () => {
    const map = HashMap(8, 0.5);
    expect(map.capacity).toBe(8);
    expect(map.loadFactor).toBe(0.5);
    expect(map.buckets).toHaveLength(8);
  });

  test('every bucket is its own independent list', () => {
    const map = HashMap();
    expect(new Set(map.buckets).size).toBe(map.buckets.length);
  });
});


// hash(key)
describe('hash(key)', () => {
  test('returns an integer', () => {
    const map = HashMap();
    expect(Number.isInteger(map.hash('apple'))).toBe(true);
  });

  test('returns an index between 0 and capacity - 1', () => {
    const map = HashMap();
    for (const [key] of data) {
      const index = map.hash(key);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(map.capacity);
    }
  });

  test('is deterministic: the same key always gives the same code', () => {
    const map = HashMap();
    expect(map.hash('banana')).toBe(map.hash('banana'));
  });

  test('is case sensitive', () => {
    // Capacity 101 (prime): 'A' and 'a' differ by 32, which would hide
    // the difference in a capacity of 16 (32 % 16 === 0).
    const map = HashMap(101);
    expect(map.hash('Apple')).not.toBe(map.hash('apple'));
  });

  test('returns 0 for an empty string', () => {
    const map = HashMap();
    expect(map.hash('')).toBe(0);
  });

  test('always fits the current capacity, even if it is not 16', () => {
    for (const capacity of [1, 2, 7, 16, 32, 64, 1000]) {
      const map = HashMap(capacity);
      for (const [key] of data) {
        const index = map.hash(key);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(capacity);
      }
    }
  });

  test('stays accurate with very long keys (modulo on every iteration)', () => {
    const map = HashMap();
    const longKey = 'a'.repeat(100000);
    const index = map.hash(longKey);
    expect(Number.isSafeInteger(index)).toBe(true);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(map.capacity);
  });

  test('handles keys with spaces and special characters', () => {
    const map = HashMap();
    for (const key of ['ice cream', 'ñandú', '!@#$%^&*()', '日本語', '😀']) {
      const index = map.hash(key);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(map.capacity);
    }
  });

  test('uses the current capacity after the map grows', () => {
    const map = createFullMap();
    map.set('moon', 'silver'); // triggers growth to 32
    for (const [key] of data) {
      expect(map.hash(key)).toBeLessThan(32);
    }
  });
});


// set(key, value)
describe('set(key, value)', () => {
  test('stores a new entry', () => {
    const map = HashMap();
    map.set('apple', 'red');
    expect(map.get('apple')).toBe('red');
    expect(map.length()).toBe(1);
  });

  test('places the entry in the bucket given by hash(key)', () => {
    const map = HashMap();
    map.set('apple', 'red');
    const bucket = map.buckets[map.hash('apple')];
    expect(bucket.getNode('apple').value).toBe('red');
  });

  test('overwrites the value when the key already exists', () => {
    const map = HashMap();
    map.set('dog', 'brown');
    map.set('dog', 'cream');
    expect(map.get('dog')).toBe('cream');
    expect(map.length()).toBe(1);
  });

  test('overwriting does not create duplicate nodes', () => {
    const map = HashMap();
    map.set('dog', 'brown');
    map.set('dog', 'cream');
    map.set('dog', 'black');
    expect(map.keys()).toEqual(['dog']);
    expect(map.buckets[map.hash('dog')].size()).toBe(1);
  });

  test('a collision is not an update: both keys are kept', () => {
    const map = HashMap();
    const [keyA, keyB] = findCollidingKeys(map);
    map.set(keyA, 'first');
    map.set(keyB, 'second');

    expect(map.hash(keyA)).toBe(map.hash(keyB));
    expect(map.get(keyA)).toBe('first');
    expect(map.get(keyB)).toBe('second');
    expect(map.length()).toBe(2);
    expect(map.buckets[map.hash(keyA)].size()).toBe(2);
  });

  test('overwriting one key of a collision chain leaves the other untouched', () => {
    const map = HashMap();
    const [keyA, keyB, keyC] = findCollidingKeys(map, 3);
    map.set(keyA, 1);
    map.set(keyB, 2);
    map.set(keyC, 3);

    map.set(keyB, 'updated');

    expect(map.get(keyA)).toBe(1);
    expect(map.get(keyB)).toBe('updated');
    expect(map.get(keyC)).toBe(3);
    expect(map.length()).toBe(3);
  });

  test('accepts any kind of value, including falsy ones', () => {
    const map = HashMap();
    const object = { nested: true };
    const array = [1, 2, 3];
    map.set('zero', 0);
    map.set('false', false);
    map.set('null', null);
    map.set('emptyString', '');
    map.set('object', object);
    map.set('array', array);

    expect(map.get('zero')).toBe(0);
    expect(map.get('false')).toBe(false);
    expect(map.get('null')).toBeNull();
    expect(map.get('emptyString')).toBe('');
    expect(map.get('object')).toBe(object);
    expect(map.get('array')).toBe(array);
    expect(map.length()).toBe(6);
  });

  test('can store the empty string as a key', () => {
    const map = HashMap();
    map.set('', 'empty');
    expect(map.get('')).toBe('empty');
    expect(map.has('')).toBe(true);
    expect(map.length()).toBe(1);
  });

  test('does not grow while the load level is at or below the load factor', () => {
    const map = createFullMap(); // 12 / 16 = 0.75
    expect(map.length()).toBe(12);
    expect(map.capacity).toBe(16);
    expect(map.buckets).toHaveLength(16);
  });

  test('overwriting entries in a full map does not add nodes nor grow it', () => {
    const map = createFullMap();
    map.set('apple', 'green');
    map.set('hat', 'olive');
    map.set('lion', 'brown');

    expect(map.length()).toBe(12);
    expect(map.capacity).toBe(16);
    expect(map.get('apple')).toBe('green');
    expect(map.get('hat')).toBe('olive');
    expect(map.get('lion')).toBe('brown');
  });
});


// Growth (load factor)
describe('growth when exceeding the load factor', () => {
  test('doubles the capacity when a new entry exceeds the load factor', () => {
    const map = createFullMap();
    map.set('moon', 'silver');

    expect(map.capacity).toBe(32);
    expect(map.buckets).toHaveLength(32);
    expect(map.length()).toBe(13);
  });

  test('the load level drops below the load factor after growing', () => {
    const map = createFullMap();
    map.set('moon', 'silver');
    expect(map.length() / map.capacity).toBeLessThan(map.loadFactor);
  });

  test('keeps every entry reachable with its original value', () => {
    const map = createFullMap();
    map.set('moon', 'silver');

    for (const [key, value] of data) {
      expect(map.get(key)).toBe(value);
      expect(map.has(key)).toBe(true);
    }
    expect(map.get('moon')).toBe('silver');
  });

  test('rehashes: each key sits in the bucket given by the new capacity', () => {
    const map = createFullMap();
    map.set('moon', 'silver');

    map.buckets.forEach((list, index) => {
      let node = list.headNode;
      while (node !== null) {
        expect(map.hash(node.key)).toBe(index);
        node = node.nextNode;
      }
    });
  });

  test('spreads the entries among the expanded buckets', () => {
    const map = createFullMap();
    map.set('moon', 'silver');

    const usedBuckets = map.buckets.filter((list) => list.size() > 0).length;
    // 13 entries in 32 buckets should not pile up in just a couple of them.
    expect(usedBuckets).toBeGreaterThanOrEqual(8);
    expect(longestChain(map)).toBeLessThanOrEqual(4);
  });

  test('overwriting after growing only changes values', () => {
    const map = createFullMap();
    map.set('moon', 'silver');

    map.set('apple', 'green');
    map.set('moon', 'white');
    map.set('lion', 'brown');

    expect(map.length()).toBe(13);
    expect(map.capacity).toBe(32);
    expect(map.get('apple')).toBe('green');
    expect(map.get('moon')).toBe('white');
    expect(map.get('lion')).toBe('brown');
  });

  test('keeps growing as needed (16 -> 32 -> 64 -> ...)', () => {
    const map = HashMap();
    const total = 100;
    for (let i = 0; i < total; i++) map.set(`key-${i}`, i);

    expect(map.length()).toBe(total);
    expect(map.length() / map.capacity).toBeLessThanOrEqual(map.loadFactor);
    expect(map.buckets).toHaveLength(map.capacity);
    // capacity is 16 doubled n times
    expect(Math.log2(map.capacity / 16) % 1).toBe(0);

    for (let i = 0; i < total; i++) {
      expect(map.get(`key-${i}`)).toBe(i);
    }
  });

  test('respects a custom capacity and load factor', () => {
    const map = HashMap(4, 0.5); // grows when it has more than 2 entries
    map.set('a', 1);
    map.set('b', 2);
    expect(map.capacity).toBe(4);

    map.set('c', 3);
    expect(map.capacity).toBe(8);
    expect(map.length()).toBe(3);
  });

  test('the other methods keep working after growing', () => {
    const map = createFullMap();
    map.set('moon', 'silver');

    expect(map.remove('moon')).toBe(true);
    expect(map.has('moon')).toBe(false);
    expect(map.length()).toBe(12);
    expect(map.keys()).toHaveLength(12);
    expect(map.values()).toHaveLength(12);
    expect(map.entries()).toHaveLength(12);

    map.clear();
    expect(map.length()).toBe(0);
  });
});


// get(key)
describe('get(key)', () => {
  test('returns the value associated with the key', () => {
    const map = createFullMap();
    for (const [key, value] of data) {
      expect(map.get(key)).toBe(value);
    }
  });

  test('returns undefined if the key is not found', () => {
    const map = createFullMap();
    expect(map.get('cat')).toBeUndefined();
  });

  test('returns undefined on an empty map', () => {
    const map = HashMap();
    expect(map.get('apple')).toBeUndefined();
  });

  test('returns undefined for a key that only collides with a stored one', () => {
    const map = HashMap();
    const [stored, other] = findCollidingKeys(map);
    map.set(stored, 'value');
    expect(map.get(other)).toBeUndefined();
  });

  test('returns the right value for each key of a collision chain', () => {
    const map = HashMap();
    const keys = findCollidingKeys(map, 3);
    keys.forEach((key, i) => map.set(key, `value-${i}`));
    keys.forEach((key, i) => expect(map.get(key)).toBe(`value-${i}`));
  });

  test('returns undefined after the entry is removed', () => {
    const map = createFullMap();
    map.remove('dog');
    expect(map.get('dog')).toBeUndefined();
  });

  test('does not modify the map', () => {
    const map = createFullMap();
    map.get('dog');
    map.get('cat');
    expect(map.length()).toBe(12);
  });
});


// has(key)
describe('has(key)', () => {
  test('returns true for existing keys', () => {
    const map = createFullMap();
    for (const [key] of data) {
      expect(map.has(key)).toBe(true);
    }
  });

  test('returns false for missing keys', () => {
    const map = createFullMap();
    expect(map.has('cat')).toBe(false);
  });

  test('returns false on an empty map', () => {
    expect(HashMap().has('apple')).toBe(false);
  });

  test('returns a real boolean', () => {
    const map = createFullMap();
    expect(map.has('dog')).toBe(true);
    expect(map.has('cat')).toBe(false);
    expect(typeof map.has('dog')).toBe('boolean');
  });

  test('returns true even when the stored value is falsy', () => {
    const map = HashMap();
    map.set('zero', 0);
    map.set('nothing', undefined);
    map.set('no', false);
    expect(map.has('zero')).toBe(true);
    expect(map.has('nothing')).toBe(true);
    expect(map.has('no')).toBe(true);
  });

  test('returns false for a key that only collides with a stored one', () => {
    const map = HashMap();
    const [stored, other] = findCollidingKeys(map);
    map.set(stored, 'value');
    expect(map.has(stored)).toBe(true);
    expect(map.has(other)).toBe(false);
  });

  test('returns false after the key is removed', () => {
    const map = createFullMap();
    map.remove('kite');
    expect(map.has('kite')).toBe(false);
  });

  test('throws if the hash code points outside of the buckets', () => {
    const map = HashMap();
    const message = 'Trying to access index out of bounds';

    map.hash = () => -1;
    expect(() => map.has('apple')).toThrow(message);

    map.hash = () => map.buckets.length;
    expect(() => map.has('apple')).toThrow(message);
  });
});


// remove(key)
describe('remove(key)', () => {
  test('returns true and removes the entry if the key exists', () => {
    const map = createFullMap();
    expect(map.remove('kite')).toBe(true);
    expect(map.has('kite')).toBe(false);
    expect(map.get('kite')).toBeUndefined();
  });

  test('returns false if the key does not exist', () => {
    const map = createFullMap();
    expect(map.remove('cat')).toBe(false);
    expect(map.length()).toBe(12);
  });

  test('returns false on an empty map', () => {
    expect(HashMap().remove('apple')).toBe(false);
  });

  test('returns false the second time the same key is removed', () => {
    const map = createFullMap();
    expect(map.remove('dog')).toBe(true);
    expect(map.remove('dog')).toBe(false);
  });

  test('decreases the length by one', () => {
    const map = createFullMap();
    map.remove('lion');
    expect(map.length()).toBe(11);
  });

  test('does not affect the other entries', () => {
    const map = createFullMap();
    map.remove('hat');
    for (const [key, value] of data) {
      if (key === 'hat') continue;
      expect(map.get(key)).toBe(value);
    }
  });

  test('removes the first, a middle and the last node of a collision chain', () => {
    const map = HashMap();
    const [a, b, c, d] = findCollidingKeys(map, 4);
    [a, b, c, d].forEach((key, i) => map.set(key, i));

    expect(map.remove(a)).toBe(true); // head
    expect(map.remove(c)).toBe(true); // middle
    expect(map.remove(d)).toBe(true); // tail

    expect(map.has(a)).toBe(false);
    expect(map.has(c)).toBe(false);
    expect(map.has(d)).toBe(false);
    expect(map.get(b)).toBe(1);
    expect(map.length()).toBe(1);
    expect(map.buckets[map.hash(b)].size()).toBe(1);
  });

  test('returns false for a key that only collides with a stored one', () => {
    const map = HashMap();
    const [stored, other] = findCollidingKeys(map);
    map.set(stored, 'value');
    expect(map.remove(other)).toBe(false);
    expect(map.has(stored)).toBe(true);
  });

  test('allows setting the key again after removing it', () => {
    const map = HashMap();
    map.set('dog', 'brown');
    map.remove('dog');
    map.set('dog', 'white');
    expect(map.get('dog')).toBe('white');
    expect(map.length()).toBe(1);
  });

  test('can empty the whole map one key at a time', () => {
    const map = createFullMap();
    for (const [key] of data) {
      expect(map.remove(key)).toBe(true);
    }
    expect(map.length()).toBe(0);
    expect(map.keys()).toEqual([]);
  });
});


// length()
describe('length()', () => {
  test('is 0 for a new map', () => {
    expect(HashMap().length()).toBe(0);
  });

  test('counts the stored keys', () => {
    const map = HashMap();
    map.set('apple', 'red');
    expect(map.length()).toBe(1);
    map.set('banana', 'yellow');
    expect(map.length()).toBe(2);
  });

  test('counts all the keys of the assignment data', () => {
    expect(createFullMap().length()).toBe(12);
  });

  test('counts keys that collide in the same bucket', () => {
    const map = HashMap();
    findCollidingKeys(map, 3).forEach((key) => map.set(key, true));
    expect(map.length()).toBe(3);
  });

  test('does not change when a value is overwritten', () => {
    const map = createFullMap();
    map.set('apple', 'green');
    expect(map.length()).toBe(12);
  });

  test('counts entries whose value is falsy', () => {
    const map = HashMap();
    map.set('a', 0);
    map.set('b', null);
    map.set('c', undefined);
    map.set('d', '');
    expect(map.length()).toBe(4);
  });

  test('counts a key that is the empty string', () => {
    const map = HashMap();
    map.set('', 'empty');
    map.set('a', 'letter');
    expect(map.length()).toBe(2);
  });

  test('is 13 after adding "moon" to the assignment data', () => {
    const map = createFullMap();
    map.set('moon', 'silver');
    expect(map.length()).toBe(13);
  });
});


// clear()
describe('clear()', () => {
  test('removes all the entries', () => {
    const map = createFullMap();
    map.clear();
    expect(map.length()).toBe(0);
    expect(map.keys()).toEqual([]);
    expect(map.values()).toEqual([]);
    expect(map.entries()).toEqual([]);
  });

  test('previous keys are no longer found', () => {
    const map = createFullMap();
    map.clear();
    for (const [key] of data) {
      expect(map.has(key)).toBe(false);
      expect(map.get(key)).toBeUndefined();
    }
  });

  test('keeps one empty bucket per unit of capacity', () => {
    const map = createFullMap();
    map.clear();
    expect(map.buckets).toHaveLength(map.capacity);
    expect(map.buckets.every((list) => list.headNode === null)).toBe(true);
  });

  test('keeps the grown capacity (does not go back to 16)', () => {
    const map = createFullMap();
    map.set('moon', 'silver'); // capacity 32
    map.clear();
    expect(map.capacity).toBe(32);
    expect(map.buckets).toHaveLength(32);
  });

  test('works on an empty map', () => {
    const map = HashMap();
    expect(() => map.clear()).not.toThrow();
    expect(map.length()).toBe(0);
  });

  test('the map can be used again after clearing it', () => {
    const map = createFullMap();
    map.clear();
    map.set('apple', 'green');
    expect(map.get('apple')).toBe('green');
    expect(map.length()).toBe(1);
  });
});


// keys(), values() and entries()
describe('keys()', () => {
  test('returns an empty array for an empty map', () => {
    expect(HashMap().keys()).toEqual([]);
  });

  test('returns all the keys (not the values)', () => {
    const map = createFullMap();
    const expected = data.map(([key]) => key).sort();
    expect(map.keys().sort()).toEqual(expected);
  });

  test('has no duplicates after overwriting', () => {
    const map = createFullMap();
    map.set('apple', 'green');
    map.set('dog', 'cream');
    const keys = map.keys();
    expect(keys).toHaveLength(12);
    expect(new Set(keys).size).toBe(12);
  });

  test('includes keys that collide in the same bucket', () => {
    const map = HashMap();
    const colliding = findCollidingKeys(map, 3);
    colliding.forEach((key) => map.set(key, true));
    expect(map.keys().sort()).toEqual([...colliding].sort());
  });

  test('reflects removals', () => {
    const map = createFullMap();
    map.remove('apple');
    expect(map.keys()).not.toContain('apple');
    expect(map.keys()).toHaveLength(11);
  });

  test('returns all the keys after growing', () => {
    const map = createFullMap();
    map.set('moon', 'silver');
    const expected = [...data.map(([key]) => key), 'moon'].sort();
    expect(map.keys().sort()).toEqual(expected);
  });

  test('returns a new array each time', () => {
    const map = createFullMap();
    const first = map.keys();
    first.push('hacked');
    expect(map.keys()).not.toContain('hacked');
  });
});

describe('values()', () => {
  test('returns an empty array for an empty map', () => {
    expect(HashMap().values()).toEqual([]);
  });

  test('returns all the values (not the keys)', () => {
    const map = createFullMap();
    const expected = data.map(([, value]) => value).sort();
    expect(map.values().sort()).toEqual(expected);
  });

  test('returns the updated value after overwriting', () => {
    const map = createFullMap();
    map.set('dog', 'cream');
    const values = map.values();
    expect(values).toContain('cream');
    expect(values).not.toContain('brown');
    expect(values).toHaveLength(12);
  });

  test('keeps repeated values from different keys', () => {
    const map = HashMap();
    map.set('a', 'same');
    map.set('b', 'same');
    expect(map.values()).toEqual(['same', 'same']);
  });

  test('includes falsy values', () => {
    const map = HashMap();
    map.set('a', 0);
    map.set('b', false);
    map.set('c', null);
    expect(map.values()).toHaveLength(3);
    expect(map.values()).toEqual(expect.arrayContaining([0, false, null]));
  });

  test('returns all the values after growing', () => {
    const map = createFullMap();
    map.set('moon', 'silver');
    const expected = [...data.map(([, value]) => value), 'silver'].sort();
    expect(map.values().sort()).toEqual(expected);
  });
});

describe('entries()', () => {
  test('returns an empty array for an empty map', () => {
    expect(HashMap().entries()).toEqual([]);
  });

  test('returns every [key, value] pair in its own array', () => {
    const map = createFullMap();
    const entries = map.entries();

    expect(entries).toHaveLength(12);
    for (const entry of entries) {
      expect(Array.isArray(entry)).toBe(true);
      expect(entry).toHaveLength(2);
    }
    expect(sortEntries(entries)).toEqual(sortEntries(data));
  });

  test('pairs each key with its own value', () => {
    const map = createFullMap();
    for (const [key, value] of map.entries()) {
      expect(map.get(key)).toBe(value);
    }
  });

  test('is consistent with keys() and values()', () => {
    const map = createFullMap();
    const entries = map.entries();
    expect(entries.map(([key]) => key)).toEqual(map.keys());
    expect(entries.map(([, value]) => value)).toEqual(map.values());
  });

  test('reflects overwrites and removals', () => {
    const map = createFullMap();
    map.set('dog', 'cream');
    map.remove('apple');

    const entries = map.entries();
    expect(entries).toHaveLength(11);
    expect(entries).toContainEqual(['dog', 'cream']);
    expect(entries).not.toContainEqual(['dog', 'brown']);
    expect(entries.map(([key]) => key)).not.toContain('apple');
  });

  test('returns all the pairs after growing', () => {
    const map = createFullMap();
    map.set('moon', 'silver');
    const expected = [...data, ['moon', 'silver']];
    expect(sortEntries(map.entries())).toEqual(sortEntries(expected));
  });
});


// Full scenario from "Test your hash map" (The Odin Project)
describe('assignment scenario', () => {
  test('follows the steps of the assignment from start to finish', () => {
    const test = HashMap();

    // Populate: load level is exactly 0.75.
    for (const [key, value] of data) test.set(key, value);
    expect(test.length() / test.capacity).toBe(0.75);

    // Overwrite with a full map: nothing is added and nothing grows.
    test.set('apple', 'green');
    test.set('hat', 'olive');
    expect(test.length()).toBe(12);
    expect(test.capacity).toBe(16);

    // Exceed the load factor: capacity doubles.
    test.set('moon', 'silver');
    expect(test.capacity).toBe(32);
    expect(test.length()).toBe(13);
    expect(test.length() / test.capacity).toBeLessThan(0.75);

    // Overwrite after growing.
    test.set('dog', 'cream');
    test.set('moon', 'white');
    expect(test.length()).toBe(13);
    expect(test.capacity).toBe(32);

    // The rest of the methods after growing.
    expect(test.get('dog')).toBe('cream');
    expect(test.get('apple')).toBe('green');
    expect(test.get('cat')).toBeUndefined();
    expect(test.has('moon')).toBe(true);
    expect(test.has('cat')).toBe(false);
    expect(test.remove('kite')).toBe(true);
    expect(test.remove('kite')).toBe(false);
    expect(test.length()).toBe(12);
    expect(test.keys()).toHaveLength(12);
    expect(test.values()).toHaveLength(12);
    expect(test.entries()).toHaveLength(12);

    test.clear();
    expect(test.length()).toBe(0);
    expect(test.entries()).toEqual([]);
  });
});