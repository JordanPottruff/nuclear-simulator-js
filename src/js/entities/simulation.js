import { Entity } from "./entity.js";
import * as Types from "./types.js";
import { EventRegistry } from "./event_registry.js";
import { EventQueue } from "../events/event_queue.js";
import { ScheduledEvent } from "../events/scheduled_event.js";

/**
 * A simulation involving entities and their events.
 *
 * The simulation starts with a given set of entities and a registered list of
 * events. There are three main types of events: spontaneous, interaction, and
 * interval. Each of these "spawn", or scheduled, differently.
 *
 * Spontaneous events are spawned when an entity is created. These events use
 * callbacks to define (1) whether a given entity is eligible for the event, (2)
 * how long in the future to schedule the event for a newly created entity, and
 * (3) the resolution of the event.
 *
 * Interaction events are spawned when a new pair of entities comes into
 * existence, normally by one of the two entities being created. These events
 * are similar to spontaneous events but focus on the state of two entities
 * instead of one.
 *
 * Finally, an interval event occurs at a constant time interval, independent of
 * any entity state.
 */
export class EntitySimulation {
  #entities;
  #eventRegistry;
  #eventQueue;
  #started;
  #timeMillis;

  /**
   * Creates a new simulation from a given set of entities and events.
   *
   * @param {(Entity[]|Set<Entity>)} entities - the initial entities for the
   * simulation.
   * @param {EventRegistry} eventRegistry - the events for this simulation.
   */
  constructor(entities, eventRegistry) {
    this.#entities = new Set(entities.map((e) => this.#createEntity(e, 0)));
    this.#eventRegistry = eventRegistry;
    this.#eventQueue = new EventQueue();
    this.#started = false;
    this.#timeMillis = 0;
  }

  #createEntity(value, createdTimeMillis) {
    return new Entity(value, createdTimeMillis);
  }

  /**
   * Starts the simulation, if not already started.
   */
  start() {
    if (!this.#started) {
      this.#init();
      this.started = true;
      this.#eventQueue.start();
    }
  }

  #init() {
    this.#spawnIntervalEvents();
    this.#spawnSpontaneousEvents(this.#entities);
    this.#spawnInteractionEvents(this.#entities);
  }

  #spawnIntervalEvents() {
    for (let intervalEvent of this.#eventRegistry.getIntervalEvents()) {
      this.#spawnIntervalEvent(intervalEvent);
    }
  }

  #spawnIntervalEvent(intervalEvent) {
    this.#eventQueue.addEvent(
      new ScheduledEvent(
        intervalEvent.intervalMillis,
        () => true,
        (timeMillis) => {
          this.#timeMillis = timeMillis;
          this.#commitSimChange(intervalEvent.executionFn(this.#getSimState()));
          this.#spawnIntervalEvent(intervalEvent);
        },
        intervalEvent.isRealTime
      )
    );
  }

  #spawnSpontaneousEvents(entities) {
    for (let spontaneousEvent of this.#eventRegistry.getSpontaneousEvents()) {
      this.#spawnSpontaneousEventForEntities(spontaneousEvent, entities);
    }
  }

  #spawnSpontaneousEventForEntities(spontaneousEvent, entities) {
    for (let entity of entities) {
      this.#spawnSpontaneousEventForEntity(spontaneousEvent, entity);
    }
  }

  #spawnSpontaneousEventForEntity(spontaneousEvent, entity) {
    if (!spontaneousEvent.selectionFn(entity)) {
      return;
    }

    let delayMillis = spontaneousEvent.schedulingFn(entity, this.#timeMillis);
    if (delayMillis !== 0 && !delayMillis) {
      return;
    }

    let scheduledEvent = new ScheduledEvent(
      delayMillis,
      () => this.#entities.has(entity),
      (timeMillis) => {
        this.timeMillis = timeMillis;
        this.#commitSimChange(
          spontaneousEvent.executionFn(entity, this.#getSimState())
        );
      },
      spontaneousEvent.isRealTime
    );

    this.#eventQueue.addEvent(scheduledEvent);
  }

  #spawnInteractionEvents(entities) {
    for (let interactionEvent of this.#eventRegistry.getInteractionEvents()) {
      this.#spawnInteractionEventForEntities(interactionEvent, entities);
    }
  }

  #spawnInteractionEventForEntities(interactionEvent, entities) {
    let alreadyProcessed = new Set();
    for (let targetEntity of entities) {
      for (let entity of this.#entities) {
        if (alreadyProcessed.has(entity)) {
          // Prevent duplicate events from being spawned.
          continue;
        }
        this.#spawnInteractionEventForEntityPair(
          interactionEvent,
          targetEntity,
          entity
        );
      }
      alreadyProcessed.add(targetEntity);
    }
  }

  #spawnInteractionEventForEntityPair(interactionEvent, entityA, entityB) {
    if (entityA === entityB) {
      return;
    }

    let firstEntity;
    let secondEntity;
    if (
      interactionEvent.firstSelectionFn(entityA) &&
      interactionEvent.secondSelectionFn(entityB)
    ) {
      firstEntity = entityA;
      secondEntity = entityB;
    } else if (
      interactionEvent.firstSelectionFn(entityB) &&
      interactionEvent.secondSelectionFn(entityA)
    ) {
      firstEntity = entityB;
      secondEntity = entityA;
    } else {
      return;
    }

    let delayMillis = interactionEvent.schedulingFn(
      firstEntity,
      secondEntity,
      this.#timeMillis
    );

    if (delayMillis !== 0 && !delayMillis) {
      return;
    }

    let scheduledEvent = new ScheduledEvent(
      delayMillis,
      () => this.#entities.has(firstEntity) && this.#entities.has(secondEntity),
      (timeMillis) => {
        this.#timeMillis = timeMillis;
        this.#commitSimChange(
          interactionEvent.executionFn(
            firstEntity,
            secondEntity,
            this.#getSimState()
          )
        );
      },
      interactionEvent.isRealTime
    );

    this.#eventQueue.addEvent(scheduledEvent);
  }

  /**
   * Fetches the current state of the simulation.
   *
   * @returns {Types.SimState} - the current simulation state.
   */
  #getSimState() {
    return {
      entities: this.#entities,
      timeMillis: this.#timeMillis,
    };
  }

  /**
   * Applies a given change to the simulation.
   *
   * @param {Types.SimChange} change - the change to make to the current simulation.
   */
  #commitSimChange(change) {
    if (!change) {
      return;
    }

    // Delete the removed entities from the state.
    for (let entityToDelete of change.removedEntities) {
      this.#entities.delete(entityToDelete);
    }

    // Wrap the added values in entity objects.
    let entitiesToAdd = change.addedEntityValues.map((entityVal) =>
      this.#createEntity(entityVal, this.#timeMillis)
    );

    // Add the entity objects to the state.
    for (let entityToAdd of entitiesToAdd) {
      this.#entities.add(entityToAdd);
    }

    // Spawn events for these new entities, specifically.
    this.#spawnSpontaneousEvents(entitiesToAdd);
    this.#spawnInteractionEvents(entitiesToAdd);
  }
}
