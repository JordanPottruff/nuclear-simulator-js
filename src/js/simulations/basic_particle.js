import { EventRegistry } from "../entities/event_registry.js";
import {
  addParticleHorizontalScreenCollisionEvent,
  addParticleVerticalScreenCollisionEvent,
  addParticleCollisionEvent,
} from "../particles/physics.js";
import { Particle } from "../particles/particle.js";

export class BasicParticleSimulation {
  #screenWidth;
  #screenHeight;
  #numParticlesAcross;
  #maxVelocity;
  #paddingPercentage;

  constructor(
    screenWidth,
    screenHeight,
    numParticlesAcross,
    maxVelocity,
    paddingPercentage = 0.25
  ) {
    this.#screenWidth = screenWidth;
    this.#screenHeight = screenHeight;
    this.#numParticlesAcross = numParticlesAcross;
    this.#maxVelocity = maxVelocity;
    this.#paddingPercentage = paddingPercentage;
  }

  getRegistry() {
    let registry = new EventRegistry();
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
    addParticleCollisionEvent(
      registry,
      () => true,
      () => true
    );
    return registry;
  }

  getParticlesBasic() {
    return [
      new Particle(500, 480, 0, 50, 50, 10, { red: 255, green: 0, blue: 0 }),
      new Particle(500, 520, 0, -50, 50, 10, { red: 0, green: 0, blue: 255 }),
    ];
  }

  getParticles() {
    let particles = [];

    for (let i = 0; i < this.#numParticlesAcross; i++) {
      for (let j = 0; j < this.#numParticlesAcross; j++) {
        let sectorWidth = this.#screenWidth / this.#numParticlesAcross;
        let sectorHeight = this.#screenHeight / this.#numParticlesAcross;
        let sectorX = i * sectorWidth;
        let sectorY = j * sectorHeight;

        let particleRadius =
          ((1 - this.#paddingPercentage) *
            (Math.min(sectorWidth, sectorHeight) * Math.random())) /
          2;
        let particleX =
          sectorX +
          particleRadius +
          Math.random() * (sectorWidth - particleRadius * 2);
        let particleY =
          sectorY +
          particleRadius +
          Math.random() * (sectorHeight - particleRadius * 2);
        let particleVx = this.#maxVelocity * (Math.random() * 2 - 1);
        let particleVy = this.#maxVelocity * (Math.random() * 2 - 1);
        let particleColor = {
          red: Math.random(),
          green: Math.random(),
          blue: Math.random(),
        };
        particles.push(
          new Particle(
            particleX,
            particleY,
            particleVx,
            particleVy,
            particleRadius,
            particleRadius,
            particleColor
          )
        );
      }
    }

    return particles;
  }
}
