import { ScheduledEvent } from "./events/scheduled_event.js";
import { EventQueue } from "./events/event_queue.js";

let eventQueue = new EventQueue();

eventQueue.addEvent(
  new ScheduledEvent(
    1000,
    () => true,
    () => console.log("1"),
    true
  )
);

eventQueue.addEvent(
  new ScheduledEvent(
    2000,
    () => true,
    () => console.log("2"),
    true
  )
);

eventQueue.addEvent(
  new ScheduledEvent(
    3000,
    () => true,
    () => console.log("3"),
    true
  )
);

eventQueue.start();
