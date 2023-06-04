class EventRegistry {
  constructor() {
    this.creationEvents = new Array();
    this.interactionEvents = new Array();
  }

  /**
   * Registers an event that is executed after an entity is created.
   *
   * @param timingFn function that, given an entity, returns the delay in
   * milliseconds until this event is executed or null if the event should not
   * occur.
   * @param executionFn function that performs the event on the given entity and
   * returns a resulting StateChange.
   */
  addCreationEvent(timingFn, executionFn) {
    this.creationEvents.push({
      timingFn,
      executionFn,
    });
  }

  /**
   * Registers an event involving the interaction of two entities.
   *
   * @param timingFn function that, given two entities, returns the delay in
   * milliseconds until this event is executed or null if the event should not
   * occur.
   * @param executionFn function that performs the event on the given entities
   * and returns a resulting StateChange.
   */
  addInteractionEvent(timingFn, executionFn) {
    this.interactionEvents.push({
      timingFn,
      executionFn,
    });
    this.interactionEvents.push({
      timingFn: (a, b) => timingFn(b, a),
      executionFn: (a, b, state) => executionFn(b, a, state),
    });
  }
}

class StateChange {
  constructor() {
    this.entitiesAdded = new Set();
    this.entitiesRemoved = new Set();
  }

  addAddedEntity(entity) {
    this.entitiesAdded.add(entity);
  }

  addRemovedEntity(entity) {
    this.entitiesRemoved.add(entity);
  }
}
