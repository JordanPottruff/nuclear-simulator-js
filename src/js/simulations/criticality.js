import { EventRegistry } from "../entities/event_registry.js";
import { EntitySimulation } from "../entities/simulation.js";
import { addParticleDecayEvent } from "../particles/decay.js";
import { addParticleDrawEvent } from "../particles/draw.js";
import { addParticleFissionEvent } from "../particles/fission.js";
import { Particle } from "../particles/particle.js";

const FISSION_PROBABILITY = 0.05;
const URANIUM_GRID_WIDTH = 80;
const URANIUM_GRID_HOLE_RADIUS = 25;
const NUM_NEUTRONS = 30;

const NEUTRON_RADIUS = 1;
const NEUTRON_MASS = 1;
const NEUTRON_COLOR = { red: 0, green: 0, blue: 0 };
const NEUTRON_TYPE = "neutron";
const NEUTRON_HALF_LIFE_SECONDS = 7;
const NEUTRON_SPEED = 1000;

const URANIUM_RADIUS = 2;
const URANIUM_MASS = 235;
const URANIUM_COLOR = { red: 0, green: 0.6, blue: 0 };
const URANIUM_TYPE = "uranium";

const PRODUCT_RADIUS = 1.5;
const PRODUCT_MASS = 100;
const PRODUCT_COLOR = { red: 0.5, green: 0.5, blue: 0.5 };
const PRODUCT_TYPE = "product";

export class CriticalitySimulation {
  #screenWidth;
  #screenHeight;

  constructor(screenWidth, screenHeight) {
    this.#screenWidth = screenWidth;
    this.#screenHeight = screenHeight;
  }

  getSimulation(density) {
    return new EntitySimulation(this.getParticles(density), this.getRegistry());
  }

  getRegistry() {
    let registry = new EventRegistry();
    addParticleDrawEvent(registry);
    addParticleFissionEvent(
      registry,
      (entity) => entity.getValue().getType() === NEUTRON_TYPE,
      (entity) => entity.getValue().getType() === URANIUM_TYPE,
      () => this.#createNeutron(0, 0, 0, 0),
      () => this.#createProduct(0, 0, 0, 0),
      FISSION_PROBABILITY
    );
    addParticleDecayEvent(
      registry,
      (entity) => entity.getValue().getType() === NEUTRON_TYPE,
      NEUTRON_HALF_LIFE_SECONDS
    );
    return registry;
  }

  getParticles(density) {
    const particles = [];
    // Uranium grid.
    for (let c of this.getCircularGridCoordinates(
      URANIUM_GRID_WIDTH,
      URANIUM_RADIUS,
      density,
      this.#screenWidth,
      this.#screenHeight,
      URANIUM_GRID_HOLE_RADIUS
    )) {
      particles.push(this.#createUranium(c.x, c.y));
    }

    // Initial neutrons:
    for (let i = 0; i < NUM_NEUTRONS; i++) {
      particles.push(
        this.#createNeutron(
          this.#screenWidth / 2,
          this.#screenHeight / 2,
          Math.random() * NEUTRON_SPEED * 2 - NEUTRON_SPEED,
          Math.random() * NEUTRON_SPEED * 2 - NEUTRON_SPEED
        )
      );
    }
    return particles;
  }

  getCircularGridCoordinates(
    n,
    radius,
    density,
    width,
    height,
    holeRadius = 0
  ) {
    // Space between centers of every circle in the grid.
    const spacing = Math.sqrt((Math.PI * radius * radius) / density);
    // Total width/height of the grid, stretching from centers of circles.
    const span = (n - 1) * spacing;

    const coordinates = [];
    const xOffset = (width - span) / 2;
    for (let x = 0; x < n; x++) {
      const yOffset = (height - span) / 2;
      for (let y = 0; y < n; y++) {
        coordinates.push({
          x: xOffset + x * spacing,
          y: yOffset + y * spacing,
        });
      }
    }

    const centerX = width / 2;
    const centerY = height / 2;
    return coordinates.filter((c) => {
      const dx = c.x - centerX;
      const dy = c.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < span / 2 + 0.001 && dist + 0.001 > holeRadius;
    });
  }

  #createNeutron(x, y, vx, vy) {
    return new Particle(
      x,
      y,
      vx,
      vy,
      NEUTRON_RADIUS,
      NEUTRON_MASS,
      NEUTRON_COLOR,
      NEUTRON_TYPE
    );
  }

  #createUranium(x, y, vx = 0, vy = 0) {
    return new Particle(
      x,
      y,
      vx,
      vy,
      URANIUM_RADIUS,
      URANIUM_MASS,
      URANIUM_COLOR,
      URANIUM_TYPE
    );
  }

  #createProduct(x, y, vx, vy) {
    return new Particle(
      x,
      y,
      vx,
      vy,
      PRODUCT_RADIUS,
      PRODUCT_MASS,
      PRODUCT_COLOR,
      PRODUCT_TYPE
    );
  }
}
