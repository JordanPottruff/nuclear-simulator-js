import { Entity } from "../entities/entity.js";
import { EventRegistry } from "../entities/event_registry.js";
import { Particle } from "./particle.js";
import * as EntityTypes from "../entities/types.js";

/** Returns the time in seconds until a collision between the given particles,
 * or null if no collision will occur.
 *
 * @param {Entity<Particle>} particleEntityA
 * @param {Entity<Particle>} particleEntityB
 * @param {number} currentTimeMillis
 */
export function getParticleCollisionTime(
  particleEntityA,
  particleEntityB,
  currentTimeMillis
) {
  if (particleEntityA === particleEntityB) {
    return null;
  }

  let particleA = particleEntityA
    .getValue()
    .withMove(currentTimeMillis - particleEntityA.getCreationTimeMillis());
  let particleB = particleEntityB
    .getValue()
    .withMove(currentTimeMillis - particleEntityB.getCreationTimeMillis());

  const dx = particleA.getX() - particleB.getX();
  const dy = particleA.getY() - particleB.getY();
  if (
    Math.sqrt(dx * dx + dy * dy) <=
    particleA.getRadius() + particleB.getRadius() + 0.001
  ) {
    return null;
  }
  const dvx = particleA.getVx() - particleB.getVx();
  const dvy = particleA.getVy() - particleB.getVy();
  const dvdr = dx * dvx + dy * dvy;
  if (dvdr > 0) {
    return null;
  }

  const dvdv = dvx * dvx + dvy * dvy;
  if (dvdv == 0) {
    return null;
  }

  const drdr = dx * dx + dy * dy;
  const sigma = particleA.getRadius() + particleB.getRadius();
  const d = dvdr * dvdr - dvdv * (drdr - sigma * sigma);
  if (d < 0) {
    return null;
  }

  const answer = -(dvdr + Math.sqrt(d)) / dvdv;
  return Math.abs(answer);
}

/** Returns two particles representing the resulting state of the two given
 * particles after a collision has occurred.
 *
 * @param {Entity<Particle>} particleEntityA
 * @param {Entity<Particle>} particleEntityB
 * @param {number} currentTimeMillis
 */
export function resolveParticleCollision(
  particleEntityA,
  particleEntityB,
  collisionTimeMillis
) {
  const particleA = particleEntityA
    .getValue()
    .withMove(collisionTimeMillis - particleEntityA.getCreationTimeMillis());
  const particleB = particleEntityB
    .getValue()
    .withMove(collisionTimeMillis - particleEntityB.getCreationTimeMillis());

  const dx = particleA.getX() - particleB.getX();
  const dy = particleA.getY() - particleB.getY();
  const dvx = particleA.getVx() - particleB.getVx();
  const dvy = particleA.getVy() - particleB.getVy();
  const dvdr = dx * dvx + dy * dvy;
  const dist = particleA.getRadius() + particleB.getRadius();

  const magnitude =
    (2 * particleA.getMass() * particleB.getMass() * dvdr) /
    ((particleA.getMass() + particleB.getMass()) * dist);

  const fx = (magnitude * dx) / dist;
  const fy = (magnitude * dy) / dist;

  let newState = [
    particleA.withVelocity(
      particleA.getVx() - fx / particleA.getMass(),
      particleA.getVy() - fy / particleA.getMass()
    ),
    particleB.withVelocity(
      particleB.getVx() + fx / particleB.getMass(),
      particleB.getVy() + fy / particleB.getMass()
    ),
  ];
  return newState;
}

/** Adds an interaction event for particles colliding with one another.
 *
 * @param {EventRegistry} registry - the event registry.
 * @param {EntityTypes.selectionCallback} firstSelectionFn - the selection
 * function for the first entity.
 * @param {EntityTypes.selectionCallback} secondSelectionFn - the selection
 * function for the second entity.
 */
export function addParticleCollisionEvent(
  registry,
  firstSelectionFn,
  secondSelectionFn
) {
  registry.addInteractionEvent(
    firstSelectionFn,
    secondSelectionFn,
    (particleEntityA, particleEntityB, timeMillis) => {
      let secondsToEvent = getParticleCollisionTime(
        particleEntityA,
        particleEntityB,
        timeMillis
      );
      return secondsToEvent === null ? null : secondsToEvent * 1000;
    },
    (particleEntityA, particleEntityB, state) => {
      return {
        removedEntities: [particleEntityA, particleEntityB],
        addedEntityValues: resolveParticleCollision(
          particleEntityA,
          particleEntityB,
          state.timeMillis
        ),
      };
    },
    false
  );
}

/** Returns the time in seconds until a collision between the particle and the
 * horizontal (top and bottom) edges of the screen. */
export function getParticleHorizontalScreenCollisionTime(particle, height) {
  return getParticleScreenCollisionTime(
    particle.getY(),
    particle.getVy(),
    particle.getRadius(),
    height
  );
}

/** Returns a particle representing the result of the given particle colliding
 * with one of the horizontal (top and bottom) edges of the screen
 *
 * @param {Entity<Particle>} particleEntity
 * @param {number} collisionTimeMillis
 */
export function resolveParticleHorizontalScreenCollision(
  particleEntity,
  collisionTimeMillis
) {
  let particle = particleEntity
    .getValue()
    .withMove(collisionTimeMillis - particleEntity.getCreationTimeMillis());
  return particle.withVelocity(particle.getVx(), -particle.getVy());
}

/** Adds a creation event for particles colliding against the vertical (left and
 * right) edges of the screen.
 *
 * @param {EventRegistry} registry - the event registry.
 * @param {EntityTypes.selectionCallback} selectionFn - the selection function
 * for the event.
 * @param {number} height - the height of the screen.
 */
export function addParticleHorizontalScreenCollisionEvent(
  registry,
  selectionFn,
  height
) {
  registry.addSpontaneousEvent(
    selectionFn,
    (particleEntity) => {
      let secondsToEvent = getParticleHorizontalScreenCollisionTime(
        particleEntity.getValue(),
        height
      );
      return secondsToEvent === null ? null : secondsToEvent * 1000;
    },
    (particleEntity, state) => {
      return {
        removedEntities: [particleEntity],
        addedEntityValues: [
          resolveParticleHorizontalScreenCollision(
            particleEntity,
            state.timeMillis
          ),
        ],
      };
    },
    false
  );
}

/** Returns the time in seconds until a collision between the particle and the
 * vertical (left and right) edges of the screen. */
export function getParticleVerticalScreenCollisionTime(particle, width) {
  return getParticleScreenCollisionTime(
    particle.getX(),
    particle.getVx(),
    particle.getRadius(),
    width
  );
}

/** Returns a particle representing the result of the given particle colliding
 * with one of the vertical (left and right) edges of the screen.
 *
 * @param {Entity<Particle>} particleEntity
 * @param {number} collisionTimeMillis
 */
export function resolveParticleVerticalScreenCollision(
  particleEntity,
  collisionTimeMillis
) {
  let particle = particleEntity
    .getValue()
    .withMove(collisionTimeMillis - particleEntity.getCreationTimeMillis());
  return particle.withVelocity(-particle.getVx(), particle.getVy());
}

/** Adds a creation event for particles colliding against the vertical (left and
 * right) edges of the screen.
 *
 * @param {EventRegistry} registry - the event registry.
 * @param {EntityTypes.selectionCallback} selectionFn - the selection function
 * for the event.
 * @param {number} width - the width of the screen.
 */
export function addParticleVerticalScreenCollisionEvent(
  registry,
  selectionFn,
  width
) {
  registry.addSpontaneousEvent(
    selectionFn,
    (particleEntity) => {
      let secondsToEvent = getParticleVerticalScreenCollisionTime(
        particleEntity.getValue(),
        width
      );
      return secondsToEvent === null ? null : secondsToEvent * 1000;
    },
    (particleEntity, state) => {
      return {
        removedEntities: [particleEntity],
        addedEntityValues: [
          resolveParticleVerticalScreenCollision(
            particleEntity,
            state.timeMillis
          ),
        ],
      };
    },
    false
  );
}

export function getParticleScreenCollisionTime(
  position,
  velocity,
  radius,
  max_value
) {
  if (velocity > 0) {
    return (max_value - position - radius) / velocity;
  } else if (velocity < 0) {
    return (radius - position) / velocity;
  }
  return null;
}
