/**
 * An entity in the simulation.
 *
 * Entities are wrappers of some custom underlying value. The primary purpose of
 * having this wrapper is to store additonal, simulation-related data about the
 * entity/value.
 * @template T
 * @property {T} value - the underlying value.
 */
export class Entity {
  #value;
  #createdTimeMillis;

  constructor(value, createdTimeMillis) {
    this.#value = value;
    this.#createdTimeMillis = createdTimeMillis;
  }

  /** Returns the value underlying this entity.
   * @returns {T} the underlying value.
   */
  getValue() {
    return this.#value;
  }

  /** Returns the creation time of the entity in milliseconds. */
  getCreationTimeMillis() {
    return this.#createdTimeMillis;
  }
}
