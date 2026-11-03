import { HashMap } from "./hashMap.js";

const test = HashMap();

// keys that causes collisions (*)
test.set('apple', 'red')
test.set('banana', 'yellow')
test.set('carrot', 'orange')
test.set('dog', 'brown')
test.set('elephant', 'gray')
test.set('frog', 'green')
test.set('grape', 'purple')
test.set('hat', 'black') // (*)
test.set('ice cream', 'white')
test.set('jacket', 'blue')
test.set('kite', 'pink')
test.set('lion', 'golden') // (*)

console.log(test.buckets);

// Exceding the Load Factor.
test.set('moon', 'silver');
console.log(test.buckets);
console.log(test.length());


// Logs.
// Getting the value of an entry.
// console.log(test.get('dog'));
// console.log(test.get('hat'));

// Asking if the hash table has a key.
// console.log(test.has('dog'));
// console.log(test.has('cat'));

// Setting a new entry.
// test.set('mouse', 'cyan');

// Modifying the value of an entry.
// test.set('dog', 'cream');
// test.set('hat', 'olive');
// console.log(test.buckets);

// Removing an entry.
// test.remove('kite');
// test.remove('lion');
// console.log(test.buckets);
// console.log(test.length());

// Getting the length of the hash table.
// console.log(test.length());

// Removing all entries.
// test.clear();
// console.log(test.buckets);
// console.log(test.length());

// Getting an array with all the keys.
// console.log(test.keys());

// Getting an array with all the values.
// console.log(test.values())

// Getting an array with all the [key, value] pairs.
// console.log(test.entries())