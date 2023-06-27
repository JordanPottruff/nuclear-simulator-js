const NEUTRON_TYPE = "nuetron";
const URANIUM_TYPE = "uranium";
const PRODUCT_TYPE = "product";

const NEUTRON_RADIUS = 5;
const URANIUM_RADIUS = 20;

class NuclearCollider {
  screenWidth = 1000;
  screenHeight = 1000;

  getRegistry() {
    let registry = new EventRegistry();
    this.addFissionEvent(registry);
    addParticleHorizontalScreenCollisionEvent(registry, this.screenHeight);
    addParticleVerticalScreenCollisionEvent(registry, this.screenWidth);
    return registry;
  }

  getParticles() {
    return [
      new Particle(
        500,
        500,
        0,
        0,
        URANIUM_RADIUS,
        color(0, 255, 0),
        URANIUM_RADIUS,
        URANIUM_TYPE
      ),
      new Particle(
        100,
        100,
        100,
        100,
        NEUTRON_RADIUS,
        color("black"),
        NEUTRON_RADIUS,
        NEUTRON_TYPE
      ),
    ];
  }

  addFissionEvent(registry) {
    registry.addInteractionEvent(
      getParticleCollisionTimingFn(NEUTRON_TYPE, URANIUM_TYPE),
      (particleEntityA, particleEntityB, state) => {
        console.log("run");
        let neutronEntity;
        let uraniumEntity;
        if (particleEntityA.entity.type === NEUTRON_TYPE) {
          neutronEntity = particleEntityA;
          uraniumEntity = particleEntityB;
        } else {
          neutronEntity = particleEntityB;
          uraniumEntity = particleEntityA;
        }

        // Remove neutron and uranium entity.
        // Add two fission products and 2+ neutrons.

        const deltaTimeSecondsUranium =
          (state.timeMillis - uraniumEntity.createdTimeMillis) / 1000;

        let uranium = uraniumEntity.entity;
        let centerX = uranium.x + uranium.vx * deltaTimeSecondsUranium;
        let centerY = uranium.y + uranium.vy * deltaTimeSecondsUranium;

        let neutron = neutronEntity.entity;
        let neutronVelocity = Math.sqrt(
          neutron.vx * neutron.vx + neutron.vy * neutron.vy
        );
        let unitVx = neutron.vx / neutronVelocity;
        let unitVy = neutron.vy / neutronVelocity;

        // Product 1 is the left product when following the neutron.
        let product1X = centerX + unitVy * (URANIUM_RADIUS / 2);
        let product1Y = centerY - unitVx * (URANIUM_RADIUS / 2);

        // Rotate its velocity slightly more left than the neutron's original velocity.
        let angleLeft = (-Math.random() * Math.PI) / 8;
        let product1V = this.rotate(neutron.vx, neutron.vy, angleLeft);

        // Product 2 is the right product when following the neutron.
        let product2X = centerX - unitVy * (URANIUM_RADIUS / 2);
        let product2Y = centerY + unitVx * (URANIUM_RADIUS / 2);

        // Rotate its velocity slightkly more right than the neutron's original velocity.
        let angleRight = (Math.random() * Math.PI) / 8;
        let product2V = this.rotate(neutron.vx, neutron.vy, angleRight);

        let stateChange = new StateChange();
        stateChange.addAddedEntity(
          new Particle(
            product1X,
            product1Y,
            product1V.x,
            product1V.y,
            URANIUM_RADIUS / 2.5,
            color("red"),
            URANIUM_RADIUS / 2.5,
            PRODUCT_TYPE
          )
        );
        stateChange.addAddedEntity(
          new Particle(
            product2X,
            product2Y,
            product2V.x,
            product2V.y,
            URANIUM_RADIUS / 2.5,
            color("red"),
            URANIUM_RADIUS / 2.5,
            PRODUCT_TYPE
          )
        );
        stateChange.addRemovedEntity(neutronEntity);
        stateChange.addRemovedEntity(uraniumEntity);
        return stateChange;
      }
    );
  }

  rotate(x, y, radians) {
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);
    console.log(cos);
    console.log(sin);
    return {
      x: cos * x - sin * y,
      y: sin * x + cos * y,
    };
  }
}
