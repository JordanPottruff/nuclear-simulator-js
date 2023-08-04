import { getParticleCollisionTime } from "./physics.js";

/**
 * Adds an interaction event for a particle being fissioned by another one.
 * @param {*} registry
 * @param {*} projectileSelectionFn
 * @param {*} targetSelectionFn
 */
export function addParticleFissionEvent(
  registry,
  projectileSelectionFn,
  targetSelectionFn,
  projectileFactory,
  productFactory,
  fissionProbability = 1.0
) {
  registry.addInteractionEvent(
    projectileSelectionFn,
    targetSelectionFn,
    (projectileEntity, targetEntity, timeMillis) => {
      let secondsToEvent = getParticleCollisionTime(
        projectileEntity,
        targetEntity,
        timeMillis
      );
      return secondsToEvent === null ? null : secondsToEvent * 1000;
    },
    (projectileEntity, targetEntity, state) => {
      return resolveParticleFission(
        projectileEntity,
        targetEntity,
        state.timeMillis,
        projectileFactory,
        productFactory,
        fissionProbability
      );
    }
  );
}

export function resolveParticleFission(
  projectileEntity,
  targetEntity,
  collisionTimeMillis,
  projectileFactory,
  productFactory,
  fissionProbability = 1.0
) {
  if (Math.random() > fissionProbability) {
    return { addedEntityValues: [], removedEntities: [] };
  }

  const projectileParticle = projectileEntity
    .getValue()
    .withMove(collisionTimeMillis - projectileEntity.getCreationTimeMillis());

  const targetParticle = targetEntity
    .getValue()
    .withMove(collisionTimeMillis - targetEntity.getCreationTimeMillis());

  const [xNorm, yNorm] = normalize(
    projectileParticle.getVx(),
    projectileParticle.getVy()
  );

  const [projectile1Vx, projectile1Vy] = rotate(
    projectileParticle.getVx(),
    projectileParticle.getVy(),
    Math.random() * (Math.PI / 2)
  );

  const [projectile2Vx, projectile2Vy] = rotate(
    projectileParticle.getVx(),
    projectileParticle.getVy(),
    Math.random() * (-Math.PI / 2)
  );

  const [product1Vx, product1Vy] = scale(
    ...rotate(xNorm, yNorm, Math.random() * (Math.PI / 2)),
    20
  );
  const [product2Vx, product2Vy] = scale(
    ...rotate(xNorm, yNorm, Math.random() * (-Math.PI / 2)),
    20
  );

  const x = targetParticle.getX();
  const y = targetParticle.getY();

  return {
    addedEntityValues: [
      projectileFactory().withPositionAndVelocity(
        x,
        y,
        projectile1Vx,
        projectile1Vy
      ),
      projectileFactory().withPositionAndVelocity(
        x,
        y,
        projectile2Vx,
        projectile2Vy
      ),
      productFactory().withPositionAndVelocity(x, y, product1Vx, product1Vy),
      productFactory().withPositionAndVelocity(x, y, product2Vx, product2Vy),
    ],
    removedEntities: [projectileEntity, targetEntity],
  };
}

function normalize(x, y) {
  return scale(x, y, 1 / magnitude(x, y));
}

function scale(x, y, scalar) {
  return [x * scalar, y * scalar];
}

function magnitude(x, y) {
  return Math.sqrt(x * x + y * y);
}

function rotate(x, y, theta) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return [x * cos - y * sin, x * sin + y * cos];
}
