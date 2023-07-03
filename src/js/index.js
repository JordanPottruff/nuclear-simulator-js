import { EventRegistry } from "./entities/event_registry.js";
import { EntitySimulation } from "./entities/simulation.js";

let eventRegistry = new EventRegistry();

eventRegistry.addIntervalEvent(1000, () => console.log("Beep."), true);

eventRegistry.addIntervalEvent(500, () => console.log("Half-Beep."), true);

eventRegistry.addInteractionEvent(
  (entity) => typeof entity.getValue() === "number",
  (entity) => typeof entity.getValue() === "string",
  (numberEntity, stringEntity) => {
    return numberEntity.getValue() * 1000;
  },
  (numberEntity, stringEntity) => {
    let numberVal = numberEntity.getValue();
    let stringVal = stringEntity.getValue();

    console.log(numberVal, stringVal);

    if (numberVal % 3 === 0) {
      return {
        addedEntityValues: ["foo", numberVal + 1],
        removedEntities: [stringEntity, numberEntity],
      };
    } else {
      if (stringVal === "foo") {
        return {
          addedEntityValues: ["bar"],
          removedEntities: [stringEntity],
        };
      }

      return {
        addedEntityValues: [numberVal + 1],
        removedEntities: [numberEntity],
      };
    }
  }
);

eventRegistry.addSpontaneousEvent(
  (entity) => typeof entity.getValue() === "number",
  () => 0,
  (entity) => console.log("created: ", entity.getValue()),
  true
);

let sim = new EntitySimulation(["bah", 1], eventRegistry);

sim.start();
