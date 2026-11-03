# HashMap

A from-scratch implementation of a hash map in JavaScript, built as part of [The Odin Project's HashMap assignment](https://www.theodinproject.com/lessons/javascript-hashmap).

## Purpose

This project was made for practice and study. The goal is to understand how hash maps work under the hood: hashing keys, handling collisions, and resizing as the map fills up, instead of relying on JavaScript's built-in `Map` or objects.

## How it works

- **Hashing:** string keys are turned into a bucket index with a polynomial hash (prime number 31), applying the modulo on every iteration to avoid exceeding the maximum safe integer.
- **Collisions:** each bucket is a linked list (`LinkedList`, reused from the Linked Lists assignment), so different keys that land in the same bucket are chained instead of overwriting each other.
- **Resizing:** the map starts with a capacity of `16` and a load factor of `0.75`. When the number of entries exceeds `capacity * loadFactor`, the capacity doubles and every entry is rehashed.

## Methods

| Method | Description |
| --- | --- |
| `hash(key)` | Returns the bucket index for a key. |
| `set(key, value)` | Adds an entry, or overwrites the value if the key already exists. |
| `get(key)` | Returns the value of a key, or `undefined` if it is not found. |
| `has(key)` | Returns `true` if the key is in the map. |
| `remove(key)` | Removes an entry and returns `true`, or returns `false` if the key does not exist. |
| `length()` | Returns the number of stored keys. |
| `clear()` | Removes all entries. |
| `keys()` | Returns an array with all the keys. |
| `values()` | Returns an array with all the values. |
| `entries()` | Returns an array with all the `[key, value]` pairs. |

## Project structure

- `hashMap.js`: the `HashMap` factory function.
- `linkedList.js`: the `LinkedList` class used for the buckets.
- `main.js`: a script to try the hash map manually with the assignment's sample data.
- `test.js`: Jest tests for every method, including collisions and resizing.

## Usage

```js
import { HashMap } from "./hashmap.js";

const map = HashMap();

map.set("apple", "red");
map.set("banana", "yellow");

map.get("apple"); // "red"
map.has("cherry"); // false
map.length(); // 2
map.entries(); // [["apple", "red"], ["banana", "yellow"]]
```

## Running the tests

Install the dependencies and run Jest.

```bash
npm test
```