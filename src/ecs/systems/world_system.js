import { System } from "../core/system.js";
import { World } from "../core/world.js";
import { Entity } from "../core/entity.js";
import { Entities } from "../components/entities.js";
import { Systems } from "../components/systems.js";
import { Renderable } from "../components/renderable.js";
import { ViewCollection } from "../components/view_collection.js";
import { ThreeClock } from "../components/three_clock.js";
import { createCube } from "../../factories/cube.js";
import { SceneAssignment } from "../components/scene_assignment.js";
import { Resizer } from "../../factories/resizer.js";

class WorldSystem extends System {
  constructor(world, container, viewCollection, eventBus) {
    super(world);
    this.renderer = this.world.getComponent(Renderable).renderer;
    this.viewCollection = viewCollection;
    // TODO: Properly handle multi-view/multi-scene worlds
    // this.camera = views.cameras.get("main");
    // this.scene = views.scenes.get("main");
    this.clock = this.world.getComponent(ThreeClock).clock;

    container.append(this.renderer.domElement);
    //const resizer = new Resizer(container, this.camera, this.renderer);
    this.initialiseECSEventListeners(eventBus);
  }

  static get requiredComponents() {
    return [Renderable, Views, ThreeClock];
  }

  initialiseECSEventListeners(eventBus) {
    eventBus.subscribe("objects:single:create", (data) => {
      const entity = this.createObject(data);
      this.scene.add(entity.mesh);
    });
    eventBus.subscribe("objects:single:remove", (data) => {
      this.removeObject(data);
    });
    // Does this need to query ViewSystem to set by id?
    eventBus.subscribe("view-collections:single:set", ({ viewCollection }) => {
      this.viewCollection = viewCollection;
    });
  }

  // There are issues with Claude's code here because I think entities appear to only be added to systems
  // when the system is first added?
  // Oh, but addEntity() calls checkEntityForSystems(), so maybe not
  createEntity() {
    const entity = new Entity();
    return entity;
  }

  addEntity(entity) {
    const entitiesComp = this.world.getComponent(Entities);
    entitiesComp.entities.add(entity);
    this.checkEntityForSystems(entity);
    return entity;
  }

  removeEntity(entity) {
    const entitiesComp = this.world.getComponent(Entities);
    const systemsComp = this.world.getComponent(Systems);
    entitiesComp.entities.delete(entity);
    for (const system of systemsComp.systems) {
      system.removeEntity(entity);
    }
    entity.destroy();
  }

  addSystem(system) {
    const entitiesComp = this.world.getComponent(Entities);
    const systemsComp = this.world.getComponent(Systems);
    systemsComp.systems.add(system);
    // Check existing entities for this system
    for (const entity of entitiesComp.entities) {
      if (this.entityMatchesSystem(entity, system)) {
        system.addEntity(entity);
      }
    }
    return system;
  }

  removeSystem(system) {
    const systemsComp = this.world.getComponent(Systems);
    systemsComp.systems.delete(system);
  }

  checkEntityForSystems(entity) {
    const systemsComp = this.world.getComponent(Systems);
    for (const system of systemsComp.systems) {
      if (this.entityMatchesSystem(entity, system)) {
        system.addEntity(entity);
      }
    }
  }

  entityMatchesSystem(entity, system) {
    if (!entity.active) return false;

    const required = system.constructor.requiredComponents;
    return required.every(ComponentClass => entity.hasComponent(ComponentClass));
  }

  createObject(data) {
    // TODO: add code that does something depending on the value of generatedByOSC
    const { type, generatedByOSC } = data;
    const entity = this.createEntity();
    entity.addComponent(new SceneAssignment([ "main" ]));
    switch (type) {
    case "cube":
      this.handleCreateCube(entity, args);
      break;

    case "sphere":
      this.handleCreateSphere(entity, args);
      break;

    case "cylinder":
      this.handleCreateCylinder(entity, args);
      break;

    case "cone":
      this.handleCreateCone(entity, args);
      break;

    case "torus":
      this.handleCreateTorus(entity, args);
      break;
    }
  }

  handleCreateCube(entity, args) {
    createCube(entity, args).addComponent(new OSCEmitter("/objects/single/update"))
  }

  removeObject(data) {
    const { id } = data;

    const entitiesComp = this.world.getComponent(Entities);
    const objectData = this.entitiesComp.entities.get(id);
    if (!objectData) return false;

    // Remove from scene
    const mesh = objectData.getComponent(ThreeMesh);
    const sceneIds = objectData.getComponent(SceneAssignment)?.sceneIds || [];
    this.eventBus.emit("scenes:multiple:objects:single:remove", { sceneIds, mesh });

    // Clean up geometry and material if needed
    objectData.mesh.geometry.dispose();

    // Remove from our tracking
    this.objects.delete(id);

    // Send removal OSC message
    // if (this.oscManager) {
    // this.oscManager.sendMessage('/object/removed', {
    //   id: id,
    //   type: objectData.type,
    //   position: objectData.position
    // });

    console.log(`Removed object with ID ${id}`);
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
    const viewsComp = viewCollection.getComponent(Views);
    viewsComp.views.forEach((view) => {
      this.renderer.setViewPort(view.viewport);
      this.renderer.setScissor(view.viewport);
      this.renderer.setScissorTest(true);
      this.renderer.render(view.scene, view.camera);
    });
    this.renderer.setScissorTest(false);
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  update(deltaTime) {
    // Remove inactive entities
    const entitiesComp = this.world.getComponent(Entities);
    for (const entity of entitiesComp.entities) {
      if (!entity.active) {
        this.removeEntity(entity);
      }
    }

    // Update all systems
    const systemsComp = this.world.getComponent(Systems);
    for (const system of systemsComp.systems) {
      system.update(deltaTime);
    }
  }
}

export { WorldSystem };
