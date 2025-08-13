import { System } from "../core/system.js";
import { Transform } from "../components/transform.js";
import * as THREE from "three";
import { ThreeMesh } from "../components/three_mesh.js";


class RenderSystem extends System {
  constructor(world, scene, camera, renderer) {
    super(world);
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
  }

  static get requiredComponents() {
    return [Transform, ThreeMesh];
  }

  onEntityAdded(entity) {
    const transform = entity.getComponent(Transform);
    const three_mesh = entity.getComponent(ThreeMesh);

    if (!three_mesh.mesh) {
      // Create Three.js mesh if it doesn't exist
      three_mesh.mesh = new THREE.Mesh(three_mesh.geometry, three_mesh.material);
      three_mesh.mesh.userData.entityId = entity.id;
    }

    // Set initial transform
    three_mesh.mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
    three_mesh.mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    three_mesh.mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);

    this.scene.add(three_mesh.mesh);
  }

  onEntityRemoved(entity) {
    const three_mesh = entity.getComponent(ThreeMesh);
    if (three_mesh && three_mesh.mesh) {
      this.scene.remove(three_mesh.mesh);
      three_mesh.mesh.geometry.dispose();
      three_mesh.mesh.material.dispose();
    }
  }

  update(deltaTime) {
    // Update mesh transforms based on entity transform components
    for (const entity of this.entities) {
      const transform = entity.getComponent(Transform);
      const three_mesh = entity.getComponent(ThreeMesh);

      if (three_mesh.mesh) {
        three_mesh.mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
        three_mesh.mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        three_mesh.mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
      }
    }
  }
}
