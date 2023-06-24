class EventQueue {
  constructor() {
    this.events = new PriorityQueue((a, b) => a.compareTo(b));
    this.running = false;
    this.timeMillis = 0;
    this.realTimeMillis = 0;
  }

  addEvent(delayMillis, executionFn, validationFn) {
    this.events.insert(
      new ScheduledEvent(
        delayMillis + this.timeMillis,
        executionFn,
        validationFn,
        false
      )
    );
  }

  addRealTimeEvent(delayMillis, executionFn, validationFn) {
    this.events.insert(
      new ScheduledEvent(
        delayMillis + this.timeMillis,
        executionFn,
        validationFn,
        true
      )
    );
  }

  start() {
    this.running = true;
    this.doNextRecursively(0);
  }

  doNextRecursively(realTimeDelay) {
    let startTime = window.performance.now();
    let nextEvent = this.getNextEvent();
    this.timeMillis = nextEvent.timeMillis;

    if (nextEvent.isRealTime) {
      let realTimeDelayMillis = nextEvent.timeMillis - this.realTimeMillis;
      this.realTimeMillis = nextEvent.timeMillis;
      setTimeout(() => {
        nextEvent.executionFn(nextEvent.timeMillis);
        this.doNextRecursively(0);
      }, realTimeDelayMillis - realTimeDelay);
    } else {
      nextEvent.executionFn(nextEvent.timeMillis);
      this.doNextRecursively(
        realTimeDelay + Math.max(window.performance.now() - startTime, 0)
      );
    }
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
  constructor(timeMillis, executionFn, validationFn, isRealTime) {
    this.timeMillis = timeMillis;
    this.executionFn = executionFn;
    this.validationFn = validationFn;
    this.isRealTime = isRealTime;
  }

  compareTo(otherEvent) {
    return this.timeMillis - otherEvent.timeMillis;
  }
}
