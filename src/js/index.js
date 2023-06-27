function setup() {
  let collider = new NuclearCollider();

  createCanvas(collider.screenWidth, collider.screenHeight);
  noLoop();

  let registry = collider.getRegistry();

  registry.addIntervalEvent(17, (state) => {
    background(128);
    state.entities.forEach((entity) => {
      let particle = entity.entity;

      let deltaTime = (state.timeMillis - entity.createdTimeMillis) / 1000;
      let x = particle.x + particle.vx * deltaTime;
      let y = particle.y + particle.vy * deltaTime;
      noStroke();
      fill(particle.color);
      ellipse(x, y, particle.radius * 2, particle.radius * 2);
    });
  });

  let particles = collider.getParticles();

  let simulation = new Simulation(particles, registry);

  simulation.play();
}
