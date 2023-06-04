class EventQueue {
  constructor() {
    this.events = new PriorityQueue((a, b) => a.compareTo(b));
    this.running = false;
    this.timeMillis = 0;
  }

  addEvent(delayMillis, executionFn, validationFn) {
    this.events.insert(
      new ScheduledEvent(
        delayMillis + this.timeMillis,
        executionFn,
        validationFn
      )
    );
  }

  start() {
    this.running = true;
    this.doNextRecursively();
  }

  doNextRecursively() {
    if (!this.running) {
      return;
    }

    let nextEvent;
    do {
      if (this.events.isEmpty()) {
        return;
      }
      nextEvent = this.events.delMin();
    } while (!nextEvent.validationFn());

    setTimeout(() => {
      this.timeMillis = nextEvent.timeMillis;
      nextEvent.executionFn(this.timeMillis);
      this.doNextRecursively();
    }, nextEvent.timeMillis - this.timeMillis);
  }

  stop() {
    running = false;
  }
}

class ScheduledEvent {
  constructor(timeMillis, executionFn, validationFn) {
    this.timeMillis = timeMillis;
    this.executionFn = executionFn;
    this.validationFn = validationFn;
  }

  compareTo(otherEvent) {
    return this.timeMillis - otherEvent.timeMillis;
  }
}
