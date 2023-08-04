import { EntitySimulation } from "./entities/simulation.js";
import { CriticalitySimulation } from "./simulations/criticality.js";
import { addParticleDrawEvent } from "./particles/draw.js";

function setup() {
  let screenWidth = 1000;
  let screenHeight = 1000;

  let particleSimulation = new CriticalitySimulation(1000, 1000);

  createCanvas(screenWidth, screenHeight);
  noLoop();

  let registry = particleSimulation.getRegistry();

  addParticleDrawEvent(registry, 60);

  let simulation = new EntitySimulation(
    particleSimulation.getParticles(),
    registry
  );

  simulation.start();
}

window.setup = setup;
