import("./types.js");

export class EventRegistry {
  #spontaneousEvents;
  #interactionEvents;
  #intervalEvents;

  constructor() {
    this.#spontaneousEvents = [];
    this.#interactionEvents = [];
    this.#intervalEvents = [];
  }

  /**
   * Adds a spontaneous event to the registry.
   *
   * Spontaneous events are composed of selection, scheduling, and execution
   * functions. When a new entity is created, the selection function determines
   * whether an entity is "eligible" for the event. If so, the scheduling
   * function is executed to determine if and when it should occur. The event
   * is then scheduled accordingly.
   *
   * If the event was scheduled and is still valid by the time its processed by
   * the simulation, then the execution function is used to modify the
   * simulation state. The execution function is essentially the business logic
   * of the event.
   *
   * @param {selectionCallback} selectionFn - given an entity, returns true if
   * it is eligible for this event.
   * @param {spontaneousSchedulingCallback} schedulingFn - given an entity,
   * returns the delay until this event should be executed or null if the event
   * should not be executed.
   * @param {spontaneousExecutionCallback} executionFn - given the entity, and
   * the simulation state overall, returns the resulting change on the
   * simulation from this event.
   * @param {boolean} isRealTime - whether the event should be executed with
   * real time delay.
   */
  addSpontaneousEvent(
    selectionFn,
    schedulingFn,
    executionFn,
    isRealTime = false
  ) {
    this.#spontaneousEvents.push({
      selectionFn,
      schedulingFn,
      executionFn,
      isRealTime,
    });
  }

  /**
   * Adds a spontaneous event to the registry.
   *
   * Interaction events are composed of a pair of selection functions and a
   * scheduling and execution function. When a "new pair" of entities appears in
   * a simulation, they are eligible for an interaction event. A new pair is
   * created when one or both of the entities is newly added to the simulation.
   *
   * The selection functions are used to determine whether two entities are
   * eligible for the event and can additionally establish whcih one is "first"
   * and which one is "second".
   *
   * The scheduling function is given the two entities and returns the delay
   * until the event should occur, or null if the event should not occur. The
   * delay is from when the new pair is created.
   *
   * Finally, the execution function is used after the necessary delay has
   * passed in order to perform the business logic of the event. The execution
   * function can return a change to the simulation state. The execution
   * function will not be executed if either entity is no longer present in the
   * simulation at execution time.
   *
   * @param {selectionCallback} firstSelectionFn - matches to the "first"
   * entity, which will be the one passed to the scheduling and execution
   * functions as the first argument.
   * @param {selectionCallback} secondSelectionFn - matches to the "second"
   * entity, which will be the one passed to the scheduling and execution
   * functions as the second argument.
   * @param {interactionSchedulingCallback} schedulingFn - given the two
   * entities, returns the time delay until the interaction event executes, or
   * null if the event should not execute.
   * @param {interactionExecutionCallback} executionFn - given the two entities,
   * and the simulation state overall, returns the resulting change on the
   * simulation from this event.
   * @param {boolean} isRealTime - whether the event should be executed with
   * real time delay.
   */
  addInteractionEvent(
    firstSelectionFn,
    secondSelectionFn,
    schedulingFn,
    executionFn,
    isRealTime = false
  ) {
    this.#interactionEvents.push({
      firstSelectionFn,
      secondSelectionFn,
      schedulingFn,
      executionFn,
      isRealTime,
    });
  }

  /**
   * Adds an interval event to the registry.
   *
   * Interval events are composed of their execution function and the time
   * interval between executions. These events have access to the overall
   * simulation state during execution time, and can optionally make changes to
   * the simulation.
   *
   * @param {number} intervalMillis - the time in milliseconds between
   * executions.
   * @param {*} executionFn - given the current entity state, returns the change
   * to the simulation (or null/undefined if no change occurs).
   * @param {boolean} isRealTime - whether the event should be executed with
   * real time delay.
   */
  addIntervalEvent(intervalMillis, executionFn, isRealTime) {
    this.#intervalEvents.push({
      intervalMillis,
      executionFn,
      isRealTime,
    });
  }

  getSpontaneousEvents() {
    return this.#spontaneousEvents;
  }

  getInteractionEvents() {
    return this.#interactionEvents;
  }

  getIntervalEvents() {
    return this.#intervalEvents;
  }
}
