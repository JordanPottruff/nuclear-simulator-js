export function addParticleDecayEvent(registry, selectionFn, halfLifeSeconds) {
  registry.addSpontaneousEvent(
    selectionFn,
    () => -Math.log(1 - Math.random()) * halfLifeSeconds * 1000,
    (particleEntity) => {
      return {
        removedEntities: [particleEntity],
        addedEntityValues: [],
      };
    },
    false
  );
}
