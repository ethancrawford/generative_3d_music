import { System } from "../core/system";
import { ThreeMesh } from "../components/three_mesh";
import { Transform } from "../components/transform";

class TransformSystem extends System {
  constructor(world) {
    super(world);
  }

  static get requiredComponents() {
    return [Transform, ThreeMesh];
  }

  update(deltaTime) {
    for (const entity of this.entities) {
      const transform = entity.getComponent(Transform);
      const mesh = entity.getComponent(ThreeMesh);

      if (mesh.mesh) {
        mesh.mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
        mesh.mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        mesh.mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
      }
    }
  }
}

export { TransformSystem };
