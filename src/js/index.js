let registry = new EventRegistry();

const width = 1000;
const height = 1000;

class Particle {
  constructor(x, y, vx, vy, radius) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
  }
}

function updateParticle(particleEntity, state, invertVx, invertVy) {
  let particle = particleEntity.entity;
  console.log(state.timeMillis);
  console.log(particleEntity.createdTimeMillis);
  let deltaTime = (state.timeMillis - particleEntity.createdTimeMillis) / 1000;
  console.log("deltaTime", deltaTime);
  let newParticle = new Particle(
    particle.x + particle.vx * deltaTime,
    particle.y + particle.vy * deltaTime,
    (invertVx ? -1 : 1) * particle.vx,
    (invertVy ? -1 : 1) * particle.vy,
    particle.radius
  );
  console.log(newParticle);
  let stateChange = new StateChange();
  stateChange.addRemovedEntity(particleEntity);
  stateChange.addAddedEntity(newParticle);
  return stateChange;
}

// Left wall collision
registry.addCreationEvent(
  (particleEntity) => {
    let particle = particleEntity.entity;
    if (particle.vx == 0) {
      return null;
    }
    let time = ((particle.x - particle.radius) / -particle.vx) * 1000;
    return time > 0 ? time : null;
  },
  (particleEntity, state) => {
    console.log(state.timeMillis, "bounce left");
    return updateParticle(particleEntity, state, true, false);
  }
);

// Right wall collision
registry.addCreationEvent(
  (particleEntity) => {
    let particle = particleEntity.entity;
    if (particle.vx == 0) {
      return null;
    }
    let time = ((width - (particle.x + particle.radius)) / particle.vx) * 1000;
    return time > 0 ? time : null;
  },
  (particleEntity, state) => {
    console.log(state.timeMillis, "bounce right");
    return updateParticle(particleEntity, state, true, false);
  }
);

// Bottom wall collision
registry.addCreationEvent(
  (particleEntity) => {
    let particle = particleEntity.entity;
    if (particle.vy == 0) {
      return null;
    }
    let time = ((particle.y - particle.radius) / -particle.vy) * 1000;
    return time > 0 ? time : null;
  },
  (particleEntity, state) => {
    console.log(state.timeMillis, "bounce bottom");
    return updateParticle(particleEntity, state, false, true);
  }
);

// Top wall collision
registry.addCreationEvent(
  (particleEntity) => {
    let particle = particleEntity.entity;
    if (particle.vy == 0) {
      return null;
    }
    let time = ((height - (particle.y + particle.radius)) / particle.vy) * 1000;
    return time > 0 ? time : null;
  },
  (particleEntity, state) => {
    console.log(state.timeMillis, "bounce top");
    return updateParticle(particleEntity, state, false, true);
  }
);

let simulation = new Simulation(
  [new Particle(500, 500, -40, -50, 50)],
  registry
);

simulation.play();
