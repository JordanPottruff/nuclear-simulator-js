let queue = new EventQueue();

queue.addEvent(
  1000,
  () => console.log("1"),
  () => true
);
queue.addEvent(
  2000,
  () => console.log("2"),
  () => true
);
queue.addEvent(
  3000,
  () => console.log("3"),
  () => true
);

queue.start();
console.log("aaaah");
