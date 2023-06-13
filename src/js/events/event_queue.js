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
    this.doNextRecursively2(this.getNextEvent());
  }

  doNextRecursively() {
    let executionStartTime = Date.now();
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

    let deltaTime = nextEvent.timeMillis - this.timeMillis;
    this.timeMillis = nextEvent.timeMillis;

    nextEvent.executionFn(this.timeMillis);
    let executionDelayTime = Date.now() - executionStartTime;
    setTimeout(() => {
      this.doNextRecursively();
    }, deltaTime - executionDelayTime + Math.random() * 5);
  }

  doNextRecursively2(nextEvent) {
    let executionStartTime = Date.now();

    this.timeMillis = nextEvent.timeMillis;

    nextEvent.executionFn(this.timeMillis);

    let subsequentEvent = this.getNextEvent();
    let executionDelayTime = Date.now() - executionStartTime;
    setTimeout(() => {
      this.doNextRecursively2(subsequentEvent);
    }, Math.max(subsequentEvent.timeMillis - this.timeMillis - executionDelayTime, 0));
  }

  getNextEvent() {
    let nextEvent;
    do {
      if (this.events.isEmpty()) {
        return;
      }
      nextEvent = this.events.delMin();
    } while (!nextEvent.validationFn());
    return nextEvent;
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
