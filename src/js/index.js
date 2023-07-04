import { BasicParticleSimulation } from "./simulations/basic_particle.js";
import { EntitySimulation } from "./entities/simulation.js";

function setup() {
  let screenWidth = 1000;
  let screenHeight = 1000;
  let particleSimulation = new BasicParticleSimulation(
    screenWidth,
    screenHeight
  );

  createCanvas(screenWidth, screenHeight);
  noLoop();

  let registry = particleSimulation.getRegistry();

  registry.addIntervalEvent(
    17,
    (state) => {
      background(128);
      state.entities.forEach((entity) => {
        let particle = entity
          .getValue()
          .withMove(state.timeMillis - entity.getCreationTimeMillis());

        let c = particle.getColor();
        noStroke();
        fill(color(c.red * 255, c.green * 255, c.blue * 255));
        ellipse(
          particle.getX(),
          particle.getY(),
          particle.getRadius() * 2,
          particle.getRadius() * 2
        );
      });
    },
    true
  );

  let simulation = new EntitySimulation(
    particleSimulation.getParticles(),
    registry
  );

  simulation.start();
}

window.setup = setup;
