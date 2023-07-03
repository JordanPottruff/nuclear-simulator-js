/**
 * An entity in the simulation.
 *
 * Entities are wrappers of some custom underlying value. The primary purpose of
 * having this wrapper is to store additonal, simulation-related data about the
 * entity/value.
 */
export class Entity {
  #value;
  #createdTimeMillis;

  constructor(value, createdTimeMillis) {
    this.#value = value;
    this.#createdTimeMillis = createdTimeMillis;
  }

  /** Returns the value underlying this entity. */
  getValue() {
    return this.#value;
  }

  /** Returns the creation time of the entity in milliseconds. */
  getCreationTimeMillis() {
    return this.#createdTimeMillis;
  }
}
