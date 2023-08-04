import { EventRegistry } from "../entities/event_registry.js";
import { addParticleDecayEvent } from "../particles/decay.js";
import { addParticleFissionEvent } from "../particles/fission.js";
import { Particle } from "../particles/particle.js";
import {
  addParticleHorizontalScreenCollisionEvent,
  addParticleVerticalScreenCollisionEvent,
} from "../particles/physics.js";

const NEUTRON_RADIUS = 1;
const NEUTRON_MASS = 1;
const NEUTRON_COLOR = { red: 0, green: 0, blue: 0 };
const NEUTRON_TYPE = "neutron";
const NEUTRON_HALF_LIFE_SECONDS = 1.5;
const NEUTRON_SPEED = 500;

const URANIUM_RADIUS = 5;
const URANIUM_MASS = 235;
const URANIUM_COLOR = { red: 0, green: 1, blue: 0 };
const URANIUM_TYPE = "uranium";

const PRODUCT_RADIUS = 2;
const PRODUCT_MASS = 100;
const PRODUCT_COLOR = { red: 0.2, green: 0.2, blue: 0.2 };
const PRODUCT_TYPE = "product";

export class ChainReactionSimulation {
  #screenWidth;
  #screenHeight;

  constructor(screenWidth, screenHeight) {
    this.#screenWidth = screenWidth;
    this.#screenHeight = screenHeight;
  }

  getRegistry() {
    let registry = new EventRegistry();
    addParticleFissionEvent(
      registry,
      (entity) => entity.getValue().getType() === NEUTRON_TYPE,
      (entity) => entity.getValue().getType() === URANIUM_TYPE,
      () => this.#createNeutron(0, 0, 0, 0),
      () => this.#createProduct(0, 0, 0, 0)
    );
    addParticleHorizontalScreenCollisionEvent(
      registry,
      () => true,
      this.#screenHeight
    );
    addParticleVerticalScreenCollisionEvent(
      registry,
      () => true,
      this.#screenWidth
    );
    addParticleDecayEvent(
      registry,
      (entity) => entity.getValue().getType() === NEUTRON_TYPE,
      NEUTRON_HALF_LIFE_SECONDS
    );
    return registry;
  }

  getParticles() {
    const particles = [
      this.#createNeutron(
        10,
        10,
        (Math.random() * NEUTRON_SPEED) / 2 + NEUTRON_SPEED / 2,
        -((Math.random() * NEUTRON_SPEED) / 2 + NEUTRON_SPEED / 2)
      ),
      this.#createNeutron(
        10,
        10,
        (Math.random() * NEUTRON_SPEED) / 2 + NEUTRON_SPEED / 2,
        -((Math.random() * NEUTRON_SPEED) / 2 + NEUTRON_SPEED / 2)
      ),
      this.#createNeutron(
        10,
        10,
        (Math.random() * NEUTRON_SPEED) / 2 + NEUTRON_SPEED / 2,
        -((Math.random() * NEUTRON_SPEED) / 2 + NEUTRON_SPEED / 2)
      ),
    ];

    const width = URANIUM_RADIUS * 20;
    for (let x = 0; x < this.#screenWidth - width; x += width) {
      for (let y = 0; y < this.#screenHeight - width; y += width) {
        particles.push(this.#createUranium(x + width / 2, y + width / 2));
      }
    }
    return particles;
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
