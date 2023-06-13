class BasicCollider {
  screenWidth = 1000;
  screenHeight = 1000;

  maxParticleVelocity = 100;

  getRegistry() {
    let registry = new EventRegistry();
    addParticleHorizontalScreenCollisionEvent(registry, this.screenHeight);
    addParticleVerticalScreenCollisionEvent(registry, this.screenWidth);
    addParticleCollisionEvent(registry);
    return registry;
  }

  getParticles() {
    let particles = [];
    let numAcross = 4;
    let numDown = 4;

    for (let i = 0; i < numAcross; i++) {
      for (let j = 0; j < numDown; j++) {
        let sectorWidth = this.screenWidth / numAcross;
        let sectorHeight = this.screenHeight / numDown;
        let sectorX = i * sectorWidth;
        let sectorY = j * sectorHeight;

        let particleRadius =
          (Math.min(sectorWidth, sectorHeight) * Math.random()) / 2;
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
        let particleColor = color(
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255
        );
        particles.push(
          new Particle(
            particleX,
            particleY,
            particleVx,
            particleVy,
            particleRadius,
            particleColor,
            10
          )
        );
      }
    }

    return particles;
  }
}
