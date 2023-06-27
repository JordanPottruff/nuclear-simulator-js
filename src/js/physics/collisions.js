/** Returns the time in seconds until a collision between the given particles,
 * or null if no collision will occur. */
function getParticleCollisionTime(
  particleEntityA,
  particleEntityB,
  currentTimeMillis
) {
  if (particleEntityA === particleEntityB) {
    return null;
  }

  let particleADeltaSeconds =
    (currentTimeMillis - particleEntityA.createdTimeMillis) / 1000;
  let particleA = particleEntityA.entity;

  let particleBDeltaSeconds =
    (currentTimeMillis - particleEntityB.createdTimeMillis) / 1000;
  let particleB = particleEntityB.entity;

  const dx =
    particleA.x +
    particleA.vx * particleADeltaSeconds -
    (particleB.x + particleB.vx * particleBDeltaSeconds);
  const dy =
    particleA.y +
    particleA.vy * particleADeltaSeconds -
    (particleB.y + particleB.vy * particleBDeltaSeconds);

  const dist = particleA.radius + particleB.radius + 0.001;
  if (dx * dx + dy * dy <= dist * dist) {
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

  return -(dvdr + Math.sqrt(d)) / dvdv;
}

function getParticleCollisionTimingFn(typeA = "generic", typeB = "generic") {
  return (particleEntityA, particleEntityB, state) => {
    if (
      particleEntityA.entity.type != typeA ||
      particleEntityB.entity.type != typeB
    ) {
      return null;
    }
    let secondsToEvent = getParticleCollisionTime(
      particleEntityA,
      particleEntityB,
      state.timeMillis
    );
    console.log(secondsToEvent);
    return secondsToEvent === null ? null : secondsToEvent * 1000;
  };
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

  const deltaTimeSecondsA =
    (collisionTimeMillis - particleEntityA.createdTimeMillis) / 1000;
  const deltaTimeSecondsB =
    (collisionTimeMillis - particleEntityB.createdTimeMillis) / 1000;

  const aX = particleA.x + particleA.vx * deltaTimeSecondsA;
  const aY = particleA.y + particleA.vy * deltaTimeSecondsA;

  const bX = particleB.x + particleB.vx * deltaTimeSecondsB;
  const bY = particleB.y + particleB.vy * deltaTimeSecondsB;

  const dx = aX - bX;
  const dy = aY - bY;
  const dvx = particleA.vx - particleB.vx;
  const dvy = particleA.vy - particleB.vy;
  const dvdr = dx * dvx + dy * dvy;
  const dist = particleA.radius + particleB.radius;

  const magnitude =
    (2 * particleA.mass * particleB.mass * dvdr) /
    ((particleA.mass + particleB.mass) * dist);

  const fx = (magnitude * dx) / dist;
  const fy = (magnitude * dy) / dist;

  let newState = [
    particleA.withNewState(
      aX,
      aY,
      particleA.vx - fx / particleA.mass,
      particleA.vy - fy / particleA.mass
    ),
    particleB.withNewState(
      bX,
      bY,
      particleB.vx + fx / particleB.mass,
      particleB.vy + fy / particleB.mass
    ),
  ];
  return newState;
}

function getParticleCollisionExecutionFn() {
  return (particleEntityA, particleEntityB, state) => {
    let stateChange = new StateChange();
    stateChange.addRemovedEntity(particleEntityA);
    stateChange.addRemovedEntity(particleEntityB);
    resolveParticleCollision(
      particleEntityA,
      particleEntityB,
      state.timeMillis
    ).forEach((particle) => stateChange.addAddedEntity(particle));
    return stateChange;
  };
}

/** Adds an interaction event for particles colliding with one another. */
function addParticleCollisionEvent(registry) {
  registry.addInteractionEvent(
    getParticleCollisionTimingFn(),
    getParticleCollisionExecutionFn()
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
