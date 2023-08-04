export function addParticleDrawEvent(registry, fps = 60) {
  const millisPerFrame = Math.floor(1000 / fps);
  registry.addIntervalEvent(
    millisPerFrame,
    (state) => {
      background(220);
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
}
