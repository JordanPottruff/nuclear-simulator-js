let registry = new EventRegistry();

const width = 700;
const height = 700;

class Particle {
  constructor(x, y, vx, vy, radius) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
  }
}

function setup() {
  createCanvas(width, height);
  noLoop();
  doSimulation();
}

function updateParticle(particleEntity, state, invertVx, invertVy) {
  let particle = particleEntity.entity;
  let deltaTime = (state.timeMillis - particleEntity.createdTimeMillis) / 1000;
  let newParticle = new Particle(
    particle.x + particle.vx * deltaTime,
    particle.y + particle.vy * deltaTime,
    (invertVx ? -1 : 1) * particle.vx,
    (invertVy ? -1 : 1) * particle.vy,
    particle.radius
  );
  let stateChange = new StateChange();
  stateChange.addRemovedEntity(particleEntity);
  stateChange.addAddedEntity(newParticle);
  return stateChange;
}

// Left wall collision
registry.addCreationEvent(
  (particleEntity) => {
    let particle = particleEntity.entity;
    if (particle.vx >= 0) {
      return null;
    }
    let time = ((particle.x - particle.radius) / -particle.vx) * 1000;
    return time > 0 ? time : null;
  },
  (particleEntity, state) => {
    return updateParticle(particleEntity, state, true, false);
  }
);

// Right wall collision
registry.addCreationEvent(
  (particleEntity) => {
    let particle = particleEntity.entity;
    if (particle.vx <= 0) {
      return null;
    }
    let time = ((width - (particle.x + particle.radius)) / particle.vx) * 1000;
    return time > 0 ? time : null;
  },
  (particleEntity, state) => {
    return updateParticle(particleEntity, state, true, false);
  }
);

// Bottom wall collision
registry.addCreationEvent(
  (particleEntity) => {
    let particle = particleEntity.entity;
    if (particle.vy >= 0) {
      return null;
    }
    let time = ((particle.y - particle.radius) / -particle.vy) * 1000;
    return time > 0 ? time : null;
  },
  (particleEntity, state) => {
    return updateParticle(particleEntity, state, false, true);
  }
);

// Top wall collision
registry.addCreationEvent(
  (particleEntity) => {
    let particle = particleEntity.entity;
    if (particle.vy <= 0) {
      return null;
    }
    let time = ((height - (particle.y + particle.radius)) / particle.vy) * 1000;
    return time > 0 ? time : null;
  },
  (particleEntity, state) => {
    return updateParticle(particleEntity, state, false, true);
  }
);

registry.addIntervalEvent(17, (state) => {
  background(230);
  state.entities.forEach((entity) => {
    let particle = entity.entity;

    let deltaTime = (state.timeMillis - entity.createdTimeMillis) / 1000;
    let x = particle.x + particle.vx * deltaTime;
    let y = particle.y + particle.vy * deltaTime;
    noStroke();
    fill(200, 100, 50);
    ellipse(x, y, particle.radius * 2, particle.radius * 2);
  });
});

let particles = new Array();
for (let i = 0; i < 1000; i++) {
  particles.push(
    new Particle(
      500,
      500,
      Math.random() * 100 - 50,
      Math.random() * 100 - 50,
      Math.random() * 25
    )
  );
}

let simulation = new Simulation(particles, registry);

function doSimulation() {
  simulation.play();
}
