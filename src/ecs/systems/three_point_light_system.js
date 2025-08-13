import { System } from "../core/system.js";
import { PointLight } from "three";
import { ThreeLight } from "../components/three_light.js";

class ThreePointLightSystem extends System {
  constructor(world, scenes) {
    super(world);
    this.scenes = scenes;
    this.lightObjects = new Map();
  }

  static get requiredComponents() {
    return [ ThreeLight, ThreePointLight ];
  }

  update(deltaTime) {
    for (const entity of this.entities) {
      this.updatePointLight(entity);
    }
  }

  addToActiveScenes(light) {
    this.scenes.forEach((scene) => {
      scene.add(light);
    });
  }

  updatePointLight(entity) {
    const lightComp = entity.getComponent(ThreeLight);
    const pointLightComp = entity.getComponent(ThreePointLight);

    let light = this.lightObjects.get(entity.id);
    if (!light) {
      light = new PointLight(lightComp.color, lightComp.intensity);
      this.lightObjects.set(entity.id, light);
      this.addToActiveScenes(light);
    }

    light.decay = pointLightComp.decay;
    light.distance = pointLightComp.distance;
  }
}

export { ThreePointLightSystem };
