// Reusing the file from the Linked List assignment (with some new methods for this assignment).
import { LinkedList } from "./linkedList.js";

export function HashMap(capacity = 16, loadFactor = 0.75) {
  return {
    // Properties.
    capacity: capacity,
    loadFactor: loadFactor,
    buckets: Array.from({ length: capacity}, () => new LinkedList()),
    // having this property makes my length() method O(1), instead of traversing the lists.
    storedKeys: 0, 

    // Methods.
    // Returns a hash code from a given key.
    hash(key) {
      let hashCode = 0;

      const primeNumber = 31;
      for (let i = 0; i < key.length; i++) {
        hashCode = primeNumber * hashCode + key.charCodeAt(i);
        hashCode = hashCode % this.capacity;
      }

      return hashCode;
    },
    
    // Returns the linked list (a bucket) that corresponds to a key.
    // Checks whether the index being accessed is out of bounds.
    getList(key) {
      const index = this.hash(key);
      if (index < 0 || index >= this.buckets.length) {
        throw new Error("Trying to access index out of bounds");
      }

      const list = this.buckets[index];      
      return list;
    },

    // Asks if the hash table has the given key.
    has(key) {
      const list = this.getList(key);
      // .getNode() returns the node or undefined.
      // we convert its value into a boolean.
      const hasKey = Boolean(list.getNode(key));
      
      return hasKey;
    },

    // Sets an entry in the hash table.
    set(key, value) {      
      const list = this.getList(key);

      // if the key already exists, we get the node and update its value.
      if (list.getNode(key)) {
        list.updateNode(key, value);
        return;
      }
      
      // inserts a new node in the linked list (in the bucket), if it does not exist yet.
      list.append(key, value);
      this.storedKeys++;

      // if the hash table exceeds its capacity limit, its size doubles.
      if (this.length() > this.capacity * this.loadFactor) {
        this.resize();
      }

      return;
    },

    // Gets the value of a node given a key.
    get(key) {
      const list = this.getList(key);
      const node = list.getNode(key);

      return node ? node.value : undefined;
    },

    // Removes a node from the linked list given a key.
    remove(key) {
      const list = this.getList(key);
      const wasDeleted = list.deleteNode(key); // true if a node was deleted, false if not.
      if (wasDeleted) this.storedKeys--;
      return wasDeleted; 
    },

    // Returns the amount of stored keys.
    length() {
      return this.storedKeys;
      
      // let counter = 0; 
      // for (const list of this.buckets) {
      //   counter += list.countKeys();
      // }

      // return counter;
    },

    // Removes all the entries.
    clear() {
      // 'length: this.capacity' and not 'length: capacity' because 
      // this would reinitialize it to the default value again (16),
      // which would be an error if the hash table has increased in size.
      this.buckets = Array.from({ length: this.capacity }, () => new LinkedList());
      this.storedKeys = 0;
      return;
    },

    // Returns an array containing all the keys.
    keys() {
      return this.entries().map(([key]) => key);
    },

    // Returns an array containing all the values.
    values() {
      return this.entries().map(([, value]) => value);
    },

    // Returns an array containing all the [key, value] pairs.
    entries() {
      const result = [];
      for (const list of this.buckets) {
        let currentNode = list.headNode;
        while (currentNode !== null) {
          result.push([
            currentNode.key, 
            currentNode.value
          ]);
          currentNode = currentNode.nextNode;
        }
      }

      return result;
    },

    // Resizes the hash table by doubling its capacity.
    resize() {
      this.capacity = this.capacity * 2;
      // saves our lists [key, value] pairs.
      const data = this.entries();

      // reinitializes the hash table.
      this.buckets = Array.from({ length: this.capacity }, () => new LinkedList());
      this.storedKeys = 0;

      // Rehashing.
      for (const entry of data) {
        this.set(entry[0], entry[1]);
      }
    }
  }
}