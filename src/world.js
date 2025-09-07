import { Clock } from "three";
import debug from "debug";
import { createCube } from "./factories/cube.js";
import { createRenderer } from "./factories/renderer.js";
// import { Resizer } from "../../factories/resizer.js";
import { Active } from "./ecs/components/active.js";
import { Lifecycle } from "./ecs/components/lifecycle.js";
import { SceneAssignment } from "./ecs/components/scene_assignment.js";
import { ViewCollection } from "./ecs/components/view_collection.js";
import { View } from "./ecs/components/view.js";
import { Entity } from "./ecs/core/entity.js";
import { OSCEmitter } from "./ecs/components/osc_emitter.js";
import { ThreeMesh } from "./ecs/components/three_mesh.js";

const log = debug("app:world");

class World {
  constructor(container, sceneCollection, cameraCollection, viewCollection) {
    this.entities = new Set();
    this.systems = new Set();
    this.renderer = createRenderer();
    this.sceneCollection = sceneCollection;
    this.cameraCollection = cameraCollection;
    this.viewCollection = viewCollection;
    this.clock = new Clock();

    container.append(this.renderer.domElement);
    //const resizer = new Resizer(container, this.camera, this.renderer);
  }

  setup(viewSystem, eventBus) {
    this.initialiseECSEventListeners(viewSystem, eventBus);
  }

  initialiseECSEventListeners(viewSystem, eventBus) {
    eventBus.subscribe("objects:single:create", (data) => {
      const entity = this.createObject(data);
      const mesh = entity.getComponent(ThreeMesh).mesh;
      const scenes = viewSystem.getScenesFromViewCollection(this.viewCollection);
      scenes.forEach(scene => scene.add(mesh));
      eventBus.emit("objects:count:changed", this.entities.size);
    });
    eventBus.subscribe("objects:single:remove", (data) => {
      this.removeObject(data);
    });
    // Does this need to query ViewSystem to set by id?
    eventBus.subscribe("view-collections:single:set", ({ viewCollection }) => {
      this.viewCollection = viewCollection;
    });
  }

  createEntity(active = true) {
    let entity = new Entity().addComponent(new Lifecycle());
    if (active) {
      entity = entity.addComponent(new Active());
    }
    this.entities.add(entity);
    return entity;
  }

  addEntity(entity) {
    this.entities.add(entity);
    this.checkEntityForSystems(entity);
    return entity;
  }

  removeEntity(entity) {
    this.entities.delete(entity);
    for (const system of this.systems) {
      system.removeEntity(entity);
    }
    entity.destroy();
  }

  addSystem(system) {
    this.systems.add(system);
    // Check existing entities for this system
    for (const entity of this.entities) {
      if (this.entityMatchesSystem(entity, system)) {
        system.addEntity(entity);
      }
    }
    return system;
  }

  removeSystem(system) {
    this.systems.delete(system);
  }

  checkEntityForSystems(entity) {
    for (const system of this.systems) {
      if (this.entityMatchesSystem(entity, system)) {
        system.addEntity(entity);
      }
    }
  }

  entityMatchesSystem(entity, system) {
    const activeComp = entity.getComponent(Active);
    if (!activeComp) return false;

    const required = system.constructor.requiredComponents;
    return required.every(ComponentClass => entity.hasComponent(ComponentClass));
  }

  createObject(data) {
    // TODO: add code that does something depending on the value of generatedByOSC
    const { type, args } = data;
    let entity = this.createEntity().addComponent(new SceneAssignment([ "main" ]));
    switch (type) {
    case "cube":
      entity = this.handleCreateCube(entity, args);
      break;

    case "sphere":
      entity = this.handleCreateSphere(entity, args);
      break;

    case "cylinder":
      entity = this.handleCreateCylinder(entity, args);
      break;

    case "cone":
      entity = this.handleCreateCone(entity, args);
      break;

    case "torus":
      entity = this.handleCreateTorus(entity, args);
      break;
    }
    return entity;
  }

  handleCreateCube(entity, args) {
    return createCube(entity, args).addComponent(new OSCEmitter("/objects/single/update"))
  }

  removeObject(data) {
    const { id } = data;

    const objectData = this.entities.get(id);
    if (!objectData) return false;

    // Remove from scene
    const mesh = objectData.getComponent(ThreeMesh);
    const sceneIds = objectData.getComponent(SceneAssignment)?.sceneIds || [];
    this.eventBus.emit("scenes:multiple:objects:single:remove", { sceneIds, mesh });

    // Clean up geometry and material if needed
    objectData.mesh.geometry.dispose();

    // Remove from our tracking
    // this.objects.delete(id);

    // Send removal OSC message
    // if (this.oscManager) {
    // this.oscManager.sendMessage('/object/removed', {
    //   id: id,
    //   type: objectData.type,
    //   position: objectData.position
    // });

    log(`Removed object with ID ${id}`);
    return true;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      this.update(this.clock.getDelta());
      this.renderViewCollection(this.viewCollection);
    });
  }

  renderViewCollection(viewCollection) {
    const viewCollectionComp = viewCollection.getComponent(ViewCollection);

    viewCollectionComp.views.forEach((view) => {
      const viewComp = view.getComponent(View);
      const vp = viewComp.viewport;
      this.renderer.setViewport(vp.x, vp.y, vp.width, vp.height);
      this.renderer.setScissor(vp.x, vp.y, vp.width, vp.height);
      this.renderer.setScissorTest(true);

      const scene = this.sceneCollection.get(viewComp.sceneId);
      const camera = this.cameraCollection.get(viewComp.cameraId);

      this.renderer.render(scene, camera);
    });

    this.renderer.setScissorTest(false);
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  update(deltaTime) {
    const now = Date.now();
    const dateNow = new Date(now);
    log('Updating world at', dateNow.toLocaleDateString(), dateNow.toLocaleTimeString());
    // Remove inactive entities
    for (const entity of this.entities) {
      const activeComp = entity.getComponent(Active);
      if (!activeComp) {
        this.removeEntity(entity);
      }
    }

    // Update all systems
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }
}

export { World };
