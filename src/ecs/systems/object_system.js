import { System } from "../core/system.js";

class ObjectSystem extends System {
  constructor(scenes) {
    this.scenes = scenes;
    this.lightObjects = new Map();
  }

  static get requiredComponents() {
    return [ ThreeLight, AmbientLight ];
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
