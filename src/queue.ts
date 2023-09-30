export class Queue<P> {
  elements: { [key: number]: P };
  head: number = 0;
  tail: number = 0;

  constructor() {
    this.elements = [];
    this.head = 0;
    this.tail = 0;
  }

  enqueue = (item: P): void => {
    this.elements[this.tail] = item;
    this.tail++;
  };

  dequeue = (): P => {
    const item = this.elements[this.head];
    delete this.elements[this.head];
    this.head++;
    return item;
  };

  size = (): number => {
    return this.tail - this.head;
  };
}
