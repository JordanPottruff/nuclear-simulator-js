import { ScheduledEvent } from "./scheduled_event.js";
import { PriorityQueue } from "./priority_queue.js";

/**
 * A queue that processes a sequence of incoming events, optionally in real
 * time, according to their chronological ordering.
 */
export class EventQueue {
  #events;
  #running;
  #timeMillis;
  #realTimeMillis;

  constructor() {
    this.#events = new PriorityQueue(
      (a, b) => a.absoluteTimeMillis - b.absoluteTimeMillis
    );
    this.#running = false;
    this.#timeMillis = 0;
    this.#realTimeMillis = 0;
  }

  /**
   * Adds a new scheduled event to the queue.
   * @param {ScheduledEvent} scheduledEvent - the event to add onto the queue.
   */
  addEvent(scheduledEvent) {
    this.#events.insert({
      ...scheduledEvent,
      // For prioritization, we need to put events in terms of absolute time.
      absoluteTimeMillis: scheduledEvent.timeDelayMillis + this.#timeMillis,
    });
  }

  /**
   * Starts the processing of events in the queue.
   */
  start() {
    if (this.#running) {
      return;
    }
    this.#running = true;
    this.#run();
  }

  #run() {
    let lastRealTime = this.#getTime();
    while (this.#running) {
      let nextEvent = this.#getNextValidEvent();
      if (nextEvent === null) {
        return;
      }
      let eventTime = nextEvent.absoluteTimeMillis;
      this.#timeMillis = eventTime;

      if (nextEvent.isRealTime) {
        let realTimeDelayMillis = eventTime - this.#realTimeMillis;
        this.#realTimeMillis = eventTime;
        setTimeout(() => {
          nextEvent.executionFn(eventTime);
          this.#run();
        }, realTimeDelayMillis - (this.#getTime() - lastRealTime));
        break;
      } else {
        nextEvent.executionFn(eventTime);
      }
    }
  }

  stop() {
    this.#running = false;
  }

  /**
   *
   */
  #getNextValidEvent() {
    let nextEvent;
    do {
      if (this.#events.isEmpty()) {
        return null;
      }
      nextEvent = this.#events.delMin();
    } while (!nextEvent.validationFn());
    return nextEvent;
  }

  #getTime() {
    return window.performance.now();
  }
}
