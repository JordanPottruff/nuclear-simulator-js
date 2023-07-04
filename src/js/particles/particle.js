/**
 * The representation of an RGB color where each component is in the range of
 * [0,1].
 * @typedef {Object} Color
 * @property {number} red - the red component of the color.
 * @property {number} green - the green component of the color.
 * @property {number} blue - the blue component of the color.
 */

/**
 * Simplified representation of a particle.
 */
export class Particle {
  #x;
  #y;
  #vx;
  #vy;
  #radius;
  #mass;
  #color;

  /**
   * Creates a new particle.
   * @param {number} x the x-coordinate of the particle center.
   * @param {number} y the y-coordinate of the particle center.
   * @param {number} vx the x-component of the particle's velocity.
   * @param {number} vy the y-component of the particle's velocity.
   * @param {number} radius the radius of the particle.
   * @param {number} mass the mass of the particle.
   * @param {Color} color the color of the particle.
   */
  constructor(x, y, vx, vy, radius, mass, color) {
    this.#x = x;
    this.#y = y;
    this.#vx = vx;
    this.#vy = vy;
    this.#radius = radius;
    this.#mass = mass;
    this.#color = color;
  }

  /**
   * Returns the x-coordinate of the particle.
   * @returns {number} the x-coordinate of the center of the particle.
   */
  getX() {
    return this.#x;
  }

  /**
   * Returns the y-coordinate of the particle.
   * @returns {number} the y-coordiante of the center of the particle.
   */
  getY() {
    return this.#y;
  }

  /**
   * Returns the particle's velocity along the x-axis.
   * @returns {number} the x-component of the particle's velocity in pixels per
   * second.
   */
  getVx() {
    return this.#vx;
  }

  /**
   * Returns the particle's velocity along the y-axis.
   * @returns {number} the y-component of the particle's velocity in pixels per
   * second.
   */
  getVy() {
    return this.#vy;
  }

  /**
   * Returns the drawing radius of the particle.
   * @returns {number} the radius of the particle.
   */
  getRadius() {
    return this.#radius;
  }

  /**
   * Returns the mass of the particle.
   * @returns {number} the mass of the particle.
   */
  getMass() {
    return this.#mass;
  }

  /**
   * Returns the color of the particle.
   * @returns {Color} the color of the particle.
   */
  getColor() {
    return this.#color;
  }

  /**
   * Creates a new particle that is the result of moving the current particle
   * along the current velocity for the given amount of time.
   * @param {number} deltaTimeMillis the time in milliseconds to move the
   * particle.
   * @returns {Particle} the new particle.
   */
  withMove(deltaTimeMillis) {
    let deltaTimeSeconds = deltaTimeMillis / 1000;
    return new Particle(
      this.#x + deltaTimeSeconds * this.#vx,
      this.#y + deltaTimeSeconds * this.#vy,
      this.#vx,
      this.#vy,
      this.#radius,
      this.#mass,
      this.#color
    );
  }

  /**
   * Creates a new particle that is the result of changing only the velocity of
   * the current particle.
   * @param {number} vx the new x-velocity.
   * @param {number} vy the new y-velocity.
   * @returns {Particle} the new particle.
   */
  withVelocity(vx, vy) {
    return new Particle(
      this.#x,
      this.#y,
      vx,
      vy,
      this.#radius,
      this.#mass,
      this.#color
    );
  }
}
