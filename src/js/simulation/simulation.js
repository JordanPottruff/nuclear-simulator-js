class Simulation {
  constructor(entities, eventRegistry) {
    this.entities = new Set(entities.map((e) => this.wrapEntityValue(e, 0)));
    this.eventRegistry = eventRegistry;
    this.eventQueue = new EventQueue();
    this.started = false;
    this.timeMillis = 0;
  }

  play() {
    if (!this.started) {
      this.init();
      this.started = true;
    }
    this.eventQueue.start();
  }

  init() {
    this.spawnCreationEvents(this.entities);
    this.spawnInteractionEvents(this.entities);
    this.spawnIntervalEvents();
  }

  spawnCreationEvents(entitiesChanged) {
    this.eventRegistry.creationEvents.forEach((creationEvent) => {
      entitiesChanged.forEach((entity) =>
        this.spawnCreationEventForEntity(creationEvent, entity)
      );
    });
  }

  spawnCreationEventForEntity(creationEvent, entity) {
    let delayMillis = creationEvent.timingFn(entity);
    if (delayMillis === null) {
      return;
    }
    this.eventQueue.addEvent(
      delayMillis,
      (timeMillis) => {
        this.timeMillis = timeMillis;
        let change = creationEvent.executionFn(entity, this.getState());
        this.processStateChange(change, timeMillis);
      },
      () => {
        return this.entities.has(entity);
      }
    );
  }

  spawnInteractionEvents(entitiesChanged) {
    this.eventRegistry.interactionEvents.forEach((interactionEvent) => {
      this.spawnInteractionEventsForEntity(interactionEvent, entitiesChanged);
    });
  }

  spawnInteractionEventsForEntity(interactionEvent, entitiesChanged) {
    let alreadyProcessed = new Set();
    entitiesChanged.forEach((changedEntity) => {
      [...this.entities]
        .filter((otherEntity) => !alreadyProcessed.has(otherEntity))
        .forEach((otherEntity) =>
          this.spawnInteractionEventForEntityPair(
            interactionEvent,
            changedEntity,
            otherEntity
          )
        );
      alreadyProcessed.add(changedEntity);
    });
  }

  spawnInteractionEventForEntityPair(interactionEvent, entityA, entityB) {
    if (entityA === entityB) {
      return;
    }

    let delayMillis = interactionEvent.timingFn(entityA, entityB);
    if (delayMillis === null) {
      return;
    }

    this.eventQueue.addEvent(
      delayMillis,
      (timeMillis) => {
        this.timeMillis = timeMillis;
        let change = interactionEvent.executionFn(
          entityA,
          entityB,
          this.getState()
        );
        this.processStateChange(change, timeMillis);
      },
      () => {
        return this.entities.has(entityA) && this.entities.has(entityB);
      }
    );
  }

  spawnIntervalEvents() {
    this.eventRegistry.intervalEvents.forEach((event) =>
      this.spawnIntervalEvent(event)
    );
  }

  spawnIntervalEvent(intervalEvent) {
    this.eventQueue.addEvent(
      intervalEvent.intervalMillis,
      (timeMillis) => {
        this.timeMillis = timeMillis;
        let possibleChange = intervalEvent.executionFn(this.getState());
        if (possibleChange) {
          this.processStateChange(change, timeMillis);
        }
        this.spawnIntervalEvent(intervalEvent);
      },
      () => true
    );
  }

  getState() {
    return {
      entities: new Set(this.entities),
      timeMillis: this.timeMillis,
    };
  }

  processStateChange(stateChange, timeMillis) {
    this.entities = new Set(
      [...this.entities].filter(
        (entity) => !stateChange.entitiesRemoved.has(entity)
      )
    );

    let wrappedAdded = new Set(
      [...stateChange.entitiesAdded].map((e) =>
        this.wrapEntityValue(e, timeMillis)
      )
    );

    this.entities = new Set([...wrappedAdded, ...this.entities]);

    this.spawnCreationEvents(wrappedAdded);
    this.spawnInteractionEvents(wrappedAdded);
  }

  wrapEntityValue(entityValue, createdTimeMillis) {
    return {
      entity: entityValue,
      createdTimeMillis,
    };
  }
}
