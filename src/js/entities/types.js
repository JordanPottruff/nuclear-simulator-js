import { Entity } from "./entity.js";

/**
 * A function that matches on entities in a simulation to select them for an
 * event.
 * @callback selectionCallback
 * @param {Entity} entity - the given entity.
 * @returns {boolean} - whether the entity matches the selection constraints.
 */

/**
 * A function that, given a newly created entity, returns the time delay until a
 * spontaneous event occurs or null if the event will not occur.
 * @callback spontaneousSchedulingCallback
 * @param {Entity} entity - the created entity.
 * @param {number} timeMillis - the time at which the entity is created.
 * @returns {number} - the number of milliseconds from creation until the event
 * should be executed, or null if the event should not be scheduled at all.
 */

/**
 * A function defining how a spontaneous event on a single entity impacts the
 * simulation's state.
 * @callback spontaneousExecutionCallback
 * @param {Entity} entity - the created entity.
 * @param {SimState} state - the state of the simulation
 * when the event is executed.
 * @returns {SimChange} - the resulting change to the
 * simulation.
 */

/**
 * A function that, given a new pair of two entities, returns the time delay
 * until an interaction event occurs or null if the event will not occur.
 * @callback interactionSchedulingCallback
 * @param {Entity} firstEntity - the interaction's first entity.
 * @param {Entity} secondEntity - the interaction's second entity.
 * @param {number} timeMillis - the time at which the entity is created.
 * @returns {number} - the number of milliseconds from creation until the event
 * should be executed, or null if the event should not be scheduled at all.
 */

/**
 * A function defining how an interaction between two entities impacts the
 * simulation's state.
 * @callback interactionExecutionCallback
 * @param {Entity} entity - the created entity.
 * @param {SimState} state - the state of the simulation when the event is
 * executed.
 * @returns {SimChange} - the resulting change to the simulation.
 */

/**
 * A function defining the result of a time interval based event.
 * @callback intervalExecutionCallback
 * @param {SimState} state - the state of the simulation when the event is
 * executed.
 * @returns {SimChange} - the resulting change to the simulation, or
 * null/undefined if no change should take place.
 */

/**
 * State of the simulation at a particular time.
 * @typedef {Object} SimChange
 * @property {Set<Object>} addedEntityValues - the new values to add as entities
 * to the simulation.
 * @property {Set<Entity>} removedEntities - the existing entities to remove
 * from the simulation.
 */

/**
 * State of the simulation at a particular time.
 * @typedef {Object} SimState
 * @property {Set<Entity>} entities - the active entities in the simulation.
 * @property {number} timeMillis - the time, in milliseconds, that this state
 * was recorded.
 */

/**
 * State of the simulation at a particular time.
 * @typedef {Object} SimChange
 * @property {Set<Object>} addedEntityValues - the new values to add as entities
 * to the simulation.
 * @property {Set<Entity>} removedEntities - the existing entities to remove
 * from the simulation.
 */
