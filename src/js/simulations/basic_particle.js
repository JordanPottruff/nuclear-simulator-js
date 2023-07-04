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

  maxParticleVelocity = 50;
  paddingPercentage = 0.2;

  constructor(screenWidth, screenHeight) {
    this.#screenWidth = screenWidth;
    this.#screenHeight = screenHeight;
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
      new Particle(500, 100, 0, 50, 20, color(255, 0, 0), 10),
      new Particle(500, 900, 0, -50, 20, color(0, 255, 0), 10),
    ];
  }

  getParticles() {
    let particles = [];
    let numAcross = 20;
    let numDown = 20;

    for (let i = 0; i < numAcross; i++) {
      for (let j = 0; j < numDown; j++) {
        let sectorWidth = this.#screenWidth / numAcross;
        let sectorHeight = this.#screenHeight / numDown;
        let sectorX = i * sectorWidth;
        let sectorY = j * sectorHeight;

        let particleRadius =
          ((1 - this.paddingPercentage) *
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
        let particleVx = this.maxParticleVelocity * (Math.random() * 2 - 1);
        let particleVy = this.maxParticleVelocity * (Math.random() * 2 - 1);
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
