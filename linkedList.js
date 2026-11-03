class Node {
  constructor(key = null, value = null, nextNode = null) {
    this.key = key;
    this.value = value;
    this.nextNode = nextNode;
  }
}

export class LinkedList {
  constructor() {
    this.headNode = null;
  }

  // Adds a node at the end of the list.
  append(key, value) {
    if (this.headNode === null) {
      this.headNode = new Node(key, value);
    } else {
      let current = this.headNode;
      while(current.nextNode !== null) {
        current = current.nextNode;
      }
  
      current.nextNode = new Node(key, value);
    }
  }

  // Adds a node at beginning of the list.
  prepend(key, value) {
    // Before this.headNode changes its value, JavaScript takes the current value of this.headNode.
    this.headNode = new Node(key, value, this.headNode);
  }

  // Returns the amount of nodes (length) that the linked list has.
  size() {
    let countNodes = 0;
    let current = this.headNode;
    while (current !== null) {
      countNodes++;
      current = current.nextNode;
    }

    return countNodes;
  }

  // Returns the value of the head node.
  head() {
    return this.headNode ? this.headNode.value : undefined;
  }

  // Returns the value of the tail node.
  tail() {
    if (this.headNode === null) return undefined;

    let current = this.headNode;
    while (current.nextNode !== null) {
      current = current.nextNode;
    }
    return current.value;
  }

  // Returns the value of a node from a given index.
  at(index) {
    if (this.headNode === null) return undefined;

    let currentIndex = 0;
    let current = this.headNode;
    while (current !== null) {
      if (currentIndex === index) return current.value;
      currentIndex++;
      current = current.nextNode;
    }

    return undefined
  }

  // Removes the head node from the list and returns its value.
  pop() {
    if (this.headNode === null) return undefined;

    const headValue = this.headNode.value;
    this.headNode = this.headNode.nextNode;
    return headValue;
  }


  // Methods for the Hash Map assignment.
  // Returns a node from a given key.
  getNode(key) {
    let current = this.headNode;
    while (current !== null) {
      if (current.key === key) {
        return current;
      }
      current = current.nextNode;
    } 

    return;
  }

  // Removes a node from a given key.
  deleteNode(key) {
    if (this.headNode === null) return false;

    // if the provided key is in the head, we make the next node the new head.
    if (this.headNode.key === key) {
      this.pop();
      return true;
    }

    let current = this.headNode;
    while (current.nextNode !== null) {
      if (current.nextNode.key === key) {
        current.nextNode = current.nextNode.nextNode;
        return true;
      }
      current = current.nextNode;
    } 

    return false;
  }

  // Modifies the value of a node from a given key.
  updateNode(key, value) {
    let node = this.getNode(key);
    if (node) node.value = value;
  }

  // Returns the amount of stored keys that the linked list has.
  countKeys() {
    let counter = 0;
    let current = this.headNode;
    while (current !== null) {
      if (current.key !== null && current.key !== undefined) counter++
      current = current.nextNode;
    }
    
    return counter;
  }
}