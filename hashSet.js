// Reusing the file from the Linked List assignment (with some new methods for this assignment).
import { HashMap } from "./hashMap.js";

export function HashSet(capacity = 16, loadFactor = 0.75) {
  const map = HashMap(capacity, loadFactor);


  return {
    // Properties.
    // Getters are executed every time the property is read, so they always return the current value from the map.
    get capacity() { return map.capacity },
    get loadFactor() { return map.loadFactor },
    get buckets() { return map.buckets },

    // Methods.
    has(key) {
      return map.has(key);
    },

    set(key) {
      map.set(key, true); // true acts as a fixed value that is never exposed.
    },

    remove(key) {
      return map.remove(key);
    },

    keys() {
      return map.keys();
    },

    length() {
      return map.length();
    },

    clear() {
      map.clear();
    },

  }
}