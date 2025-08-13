import { System } from "../core/system.js";
import { DirectionalLight } from "three";
import { ThreeLight } from "../components/three_light.js";
import { ThreeDirectionalLight } from "../components/three_directional_light.js";
import { ThreeDirectionalLightTarget } from "../components/three_directional_light_target.js";
import { ThreeLightShadow } from "../components/three_light_shadow.js";
import { Transform } from "../components/transform.js";

class ThreeDirectionalLightSystem extends System {
  constructor(world, sceneCollection) {
    super(world);
    this.sceneCollection = sceneCollection;
    this.lightObjects = new Map();
  }

  static get requiredComponents() {
    return [ ThreeLight, ThreeDirectionalLight, ThreeDirectionLightTarget, ThreeLightShadow, Transform ];
  }

  update(deltaTime) {
    for (const entity of this.entities) {
      this.updateDirectionalLight(entity);
    }
  }

  addToActiveScenes(light) {
    for (const scene of sceneCollection) {
      scene.add(light);
    };
  }

  updateDirectionalLight(entity) {
    const lightComp = entity.getComponent(ThreeLight);
    const directionalLightComp = entity.getComponent(ThreeDirectionalLight);
    const directionalLightTargetComp = entity.getComponent(ThreeDirectionalLightTarget);
    const transformComp = entity.getComponent(Transform);
    const shadowComp = entity.getComponent(ThreeLightShadow);

    let light = this.lightObjects.get(entity.id);

    if (!light) {
      // Direct constructor call - no ambiguity
      light = new DirectionalLight(lightComp.color, lightComp.intensity);
      this.lightObjects.set(entity.id, light);
      this.addToActiveScenes(light);
    }

    // Handle directional light specific properties
    light.position.set(
      transformComp.position.x,
      transformComp.position.y,
      transformComp.position.z
    );

    light.target.position.set(
      directionalLightTargetComp.target.x,
      directionalLightTargetComp.target.y,
      directionalLightTargetComp.target.z
    );

    if (shadowComp && directionalLightComp.castShadow) {
      light.castShadow = true;
      light.shadow.mapSize.width = shadowComp.mapSize.width;
      light.shadow.mapSize.height = shadowComp.mapSize.height;

      // DirectionalLight uses OrthographicCamera for shadows
      const camera = light.shadow.camera;
      camera.left = shadowComp.camera.left;
      camera.right = shadowComp.camera.right;
      camera.top = shadowComp.camera.top;
      camera.bottom = shadowComp.camera.bottom;
      camera.near = shadowComp.camera.near;
      camera.far = shadowComp.camera.far;
      camera.updateProjectionMatrix();
    }
  }
}

export { ThreeDirectionalLightSystem };
