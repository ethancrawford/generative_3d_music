import { System } from "../core/system.js";

class SceneSystem extends System {
  constructor(world, eventBus, sceneCollection) {
    super(world);
    this.eventBus = eventBus;
    this.sceneCollection = sceneCollection;

    eventBus.subscribe("scenes:multiple:object:single:remove", ({ sceneIds, mesh }) => {
      this.removeObjectFromScenes(mesh, sceneIds);
    });
  }

  removeObjectFromScenes(mesh, sceneIds) {
    // Handle removal from Three.js scenes
    sceneIds.forEach(sceneId => {
      const scene = this.sceneById(sceneId);
      if (scene) {
        // Remove Three.js object from scene
          scene.remove(mesh);
      }
    });
  }

  sceneById(sceneId) {
    sceneCollection.get(sceneId)
  }
}
export { SceneSystem };
