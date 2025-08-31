import { System } from "../core/system.js";
import { AmbientLight } from "three";
import { ThreeAmbientLight } from "../components/three_ambient_light.js";
import { ThreeLight } from "../components/three_light.js";

class ThreeAmbientLightSystem extends System {
  constructor(world, sceneCollection) {
    super(world);
    this.sceneCollection = sceneCollection;
    this.lightObjects = new Map();
  }

  static get requiredComponents() {
    return [ ThreeLight, ThreeAmbientLight ];
  }

  update(deltaTime) {
    for (const entity of this.entities) {
      this.updateAmbientLight(entity);
    }
  }

  addToActiveScenes(light) {
    for (const [_id, scene] of this.sceneCollection) {
      scene.add(light);
    };
  }

  updateAmbientLight(entity) {
    const lightComp = entity.getComponent(ThreeLight);

    let light = this.lightObjects.get(entity.id);
    if (!light) {
      light = new AmbientLight(lightComp.color, lightComp.intensity);
      this.lightObjects.set(entity.id, light);
      this.addToActiveScenes(light);
    }
  }
}

export { ThreeAmbientLightSystem };
