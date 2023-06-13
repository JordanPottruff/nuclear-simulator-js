/** Returns the time in seconds until a collision between the given particles,
 * or null if no collision will occur. */
function getParticleCollisionTime(particleA, particleB) {
  if (particleA === particleB) {
    return null;
  }

  const dx = particleA.x - particleB.x;
  const dy = particleA.y - particleB.y;

  if (Math.sqrt(dx * dx + dy * dy) < 0.001) {
    return null;
  }
  const dvx = particleA.vx - particleB.vx;
  const dvy = particleA.vy - particleB.vy;
  const dvdr = dx * dvx + dy * dvy;
  if (dvdr > 0) {
    return null;
  }

  const dvdv = dvx * dvx + dvy * dvy;
  if (dvdv == 0) {
    return null;
  }

  const drdr = dx * dx + dy * dy;
  const sigma = particleA.radius + particleB.radius;
  const d = dvdr * dvdr - dvdv * (drdr - sigma * sigma);
  if (d < 0) {
    return null;
  }

  const answer = -(dvdr + Math.sqrt(d)) / dvdv;
  return Math.abs(answer);
}

/** Returns two particles representing the resulting state of the two given
 * particles after a collision has occurred.
 */
function resolveParticleCollision(
  particleEntityA,
  particleEntityB,
  collisionTimeMillis
) {
  const particleA = particleEntityA.entity;
  const particleB = particleEntityB.entity;
  const dx = particleA.x - particleB.x;
  const dy = particleA.y - particleB.y;
  const dvx = particleA.vx - particleB.vx;
  const dvy = particleA.vy - particleB.vy;
  const dvdr = dx * dvx + dy * dvy;
  const dist = particleA.radius + particleB.radius;

  const magnitude =
    (2 * particleA.mass * particleB.mass * dvdr) /
    ((particleA.mass + particleB.mass) * dist);

  const fx = (magnitude * dx) / dist;
  const fy = (magnitude * dy) / dist;

  const deltaTimeSecondsA =
    (collisionTimeMillis - particleEntityA.createdTimeMillis) / 1000;
  const deltaTimeSecondsB =
    (collisionTimeMillis - particleEntityB.createdTimeMillis) / 1000;

  return [
    particleA.withNewState(
      particleA.x + particleA.vx * deltaTimeSecondsA,
      particleA.y + particleA.vy * deltaTimeSecondsA,
      fx / particleB.mass,
      fy / particleB.mass
    ),
    particleB.withNewState(
      particleB.x + particleB.vx * deltaTimeSecondsB,
      particleB.y + particleB.vy * deltaTimeSecondsB,
      fx / particleA.mass,
      fy / particleA.mass
    ),
  ];
}

/** Adds an interaction event for particles colliding with one another. */
function addParticleCollisionEvent(registry) {
  registry.addInteractionEvent(
    (particleEntityA, particleEntityB) => {
      let secondsToEvent = getParticleCollisionTime(
        particleEntityA.entity,
        particleEntityB.entity
      );
      return secondsToEvent === null ? null : secondsToEvent * 1000;
    },
    (particleEntityA, particleEntityB, state) => {
      let stateChange = new StateChange();
      stateChange.addRemovedEntity(particleEntityA);
      stateChange.addRemovedEntity(particleEntityB);
      resolveParticleCollision(
        particleEntityA,
        particleEntityB,
        state.timeMillis
      ).forEach((particle) => stateChange.addAddedEntity(particle));
      return stateChange;
    }
  );
}

/** Returns the time in seconds until a collision between the particle and the
 * horizontal (top and bottom) edges of the screen. */
function getParticleHorizontalScreenCollisionTime(particle, height) {
  return getParticleScreenCollisionTime(
    particle.y,
    particle.vy,
    particle.radius,
    height
  );
}

/** Returns a particle representing the result of the given particle colliding
 * with one of the horizontal (top and bottom) edges of the screen */
function resolveParticleHorizontalScreenCollision(
  particleEntity,
  collisionTimeMillis
) {
  let particle = particleEntity.entity;
  let deltaTimeSeconds =
    (collisionTimeMillis - particleEntity.createdTimeMillis) / 1000;
  return particle.withNewState(
    particle.x + particle.vx * deltaTimeSeconds,
    particle.y + particle.vy * deltaTimeSeconds,
    particle.vx,
    -particle.vy
  );
}

/** Adds a creation event for particles colliding against the vertical (left and
 * right) edges of the screen. */
function addParticleHorizontalScreenCollisionEvent(registry, height) {
  registry.addCreationEvent(
    (particleEntity) => {
      let secondsToEvent = getParticleHorizontalScreenCollisionTime(
        particleEntity.entity,
        height
      );
      return secondsToEvent === null ? null : secondsToEvent * 1000;
    },
    (particleEntity, state) => {
      let stateChange = new StateChange();
      stateChange.addRemovedEntity(particleEntity);
      stateChange.addAddedEntity(
        resolveParticleHorizontalScreenCollision(
          particleEntity,
          state.timeMillis
        )
      );
      return stateChange;
    }
  );
}

/** Returns the time in seconds until a collision between the particle and the
 * vertical (left and right) edges of the screen. */
function getParticleVerticalScreenCollisionTime(particle, width) {
  return getParticleScreenCollisionTime(
    particle.x,
    particle.vx,
    particle.radius,
    width
  );
}

/** Returns a particle representing the result of the given particle colliding
 * with one of the vertical (left and right) edges of the screen */
function resolveParticleVerticalScreenCollision(
  particleEntity,
  collisionTimeMillis
) {
  let particle = particleEntity.entity;
  let deltaTimeSeconds =
    (collisionTimeMillis - particleEntity.createdTimeMillis) / 1000;
  return particle.withNewState(
    particle.x + particle.vx * deltaTimeSeconds,
    particle.y + particle.vy * deltaTimeSeconds,
    -particle.vx,
    particle.vy
  );
}

/** Adds a creation event for particles colliding against the vertical (left and
 * right) edges of the screen. */
function addParticleVerticalScreenCollisionEvent(registry, width) {
  registry.addCreationEvent(
    (particleEntity) => {
      let secondsToEvent = getParticleVerticalScreenCollisionTime(
        particleEntity.entity,
        width
      );
      return secondsToEvent === null ? null : secondsToEvent * 1000;
    },
    (particleEntity, state) => {
      let stateChange = new StateChange();
      stateChange.addRemovedEntity(particleEntity);
      stateChange.addAddedEntity(
        resolveParticleVerticalScreenCollision(particleEntity, state.timeMillis)
      );
      return stateChange;
    }
  );
}

function getParticleScreenCollisionTime(position, velocity, radius, max_value) {
  if (velocity > 0) {
    return (max_value - position - radius) / velocity;
  } else if (velocity < 0) {
    return (radius - position) / velocity;
  }
  return null;
}
