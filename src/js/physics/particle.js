class Particle {
  constructor(x, y, vx, vy, radius, color, mass = 0) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.mass = mass;
  }

  /**
   * Creates a new particle from the current one by modifying the velocity only.
   */
  withNewState(x, y, vx, vy) {
    return new Particle(x, y, vx, vy, this.radius, this.color, this.mass);
  }

  withMove(deltaTime) {
    return new Particle(
      this.x + this.vx * deltaTime,
      this.y + this.vy * deltaTime,
      this.vx,
      this.vy,
      this.radius,
      this.color,
      this.mass
    );
  }

  draw() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }
}