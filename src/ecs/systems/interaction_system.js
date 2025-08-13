import { System } from "../core/system.js";
import * as THREE from "three";

class InteractionSystem extends System {
  constructor(world, camera, domElement) {
    super(world);
    this.camera = camera;
    this.domElement = domElement;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setupEventListeners();
  }

  static get requiredComponents() {
    return [Interactable, ThreeMesh];
  }

  setupEventListeners() {
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.domElement.addEventListener('click', (e) => this.onClick(e));
  }

  onMouseMove(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.updateHovers();
  }

  onClick(event) {
    const intersected = this.getIntersectedEntity();
    if (intersected) {
      const interactable = intersected.getComponent(Interactable);
      if (interactable.onClick) {
        interactable.onClick(intersected);
      }
    }
  }

  updateHovers() {
    // Reset all hovers
    for (const entity of this.entities) {
      const interactable = entity.getComponent(Interactable);
      interactable.hovered = false;
    }

    // Set hover for intersected entity
    const intersected = this.getIntersectedEntity();
    if (intersected) {
      const interactable = intersected.getComponent(Interactable);
      interactable.hovered = true;
      if (interactable.onHover) {
        interactable.onHover(intersected);
      }
    }
  }

  getIntersectedEntity() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const meshes = [];
    for (const entity of this.entities) {
      const three_mesh = entity.getComponent(ThreeMesh);
      if (three_mesh.mesh) {
        meshes.push(three_mesh.mesh);
      }
    }

    const intersects = this.raycaster.intersectObjects(meshes);
    if (intersects.length > 0) {
      const entityId = intersects[0].object.userData.entityId;
      return Array.from(this.entities).find(e => e.id === entityId);
    }

    return null;
  }

  update(deltaTime) {
    // Update visual feedback for interactions
    for (const entity of this.entities) {
      const interactable = entity.getComponent(Interactable);
      const three_mesh = entity.getComponent(ThreeMesh);

      if (three_mesh.mesh) {
        // Example: Change material color based on interaction state
        if (interactable.selected) {
          three_mesh.mesh.material.emissive.setHex(0x444444);
        } else if (interactable.hovered) {
          three_mesh.mesh.material.emissive.setHex(0x222222);
        } else {
          three_mesh.mesh.material.emissive.setHex(0x000000);
        }
      }
    }
  }
}
