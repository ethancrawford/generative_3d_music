import * as THREE from 'three';

import { Entity } from "./ecs/core/entity.js";
import { World } from "./world.js";

import { SceneAssignment } from "./ecs/components/scene_assignment.js";
import { ThreeDirectionalLight } from "./ecs/components/three_directional_light.js";
import { ThreeDirectionalLightTarget } from "./ecs/components/three_directional_light_target.js";
import { ThreeAmbientLight } from "./ecs/components/three_ambient_light.js";
import { ThreeLight } from "./ecs/components/three_light.js";
import { ThreeLightShadow } from "./ecs/components/three_light_shadow.js";
import { ThreePointLight } from "./ecs/components/three_point_light.js";
import { Transform } from "./ecs/components/transform.js";
import { View } from "./ecs/components/view.js";
import { ViewCollection } from "./ecs/components/view_collection.js";

import { OSCSystem } from "./ecs/systems/osc_system.js";
// import { SceneSystem } from "./ecs/systems/scene_system.js";
import { ThreeDirectionalLightSystem } from "./ecs/systems/three_directional_light_system.js";
import { ThreeAmbientLightSystem } from "./ecs/systems/three_ambient_light_system.js";
import { ThreePointLightSystem } from "./ecs/systems/three_point_light_system.js";
import { ViewSystem } from "./ecs/systems/view_system.js";
// import { WorldSystem } from "./ecs/systems/world_system.js";

import { EventBus } from "./event_bus.js";
import { createCamera } from "./factories/camera.js";
import { createScene } from "./factories/scene.js";
// import { OSCManager } from './osc_manager.js';
// import { SceneManager } from './scene_manager.js';
import { UIManager } from './ui_manager.js';
import { ViewportClickHandler } from "./event_handlers/viewport_click_handler.js";
// import { ObjectManager } from './object_manager.js';

class App {
  constructor() {
    this.container = document.querySelector('#canvas-container');
    this.eventBus = new EventBus();

    const [sceneCollection, cameraCollection, mainViewCollection, viewCollections] = this.initialiseViewRelatedObjects();
    this.world = new World(this.container, sceneCollection, cameraCollection, mainViewCollection);

    const [ambientLight, directionalLight, accentLight] = this.initialiseLights();

    const viewSystem = new ViewSystem(this.world, this.eventBus, sceneCollection, cameraCollection, viewCollections);
    // viewSystem.addViewCollection("main", mainViewCollection);
    this.world.addSystem(viewSystem);
    this.world.addSystem(new ThreeAmbientLightSystem(this.world, sceneCollection));
    this.world.addSystem(new ThreeDirectionalLightSystem(this.world, sceneCollection));
    this.world.addSystem(new ThreePointLightSystem(this.world, sceneCollection));
    this.world.addSystem(new OSCSystem(this.world, this.eventBus));
    // this.rulesManager = new RulesManager();
    this.mode = 'user'; // 'user' or 'generative'
    this.selectedPrimitive = 'cube';

    this.initializeManagers();
    this.setupEventListeners(this.world.renderer.domElement, viewSystem, this.eventBus);
    this.world.setup(viewSystem, this.eventBus);
    // this.animate();
    // this.world.start();
    console.log('Generative 3D Music App initialized');
  }

  initialiseMainViewCollection() {
    const mainView = this.initialiseView(
      {
        viewId: "main",
        sceneId: "main",
        cameraId: "main",
        viewport: { x: 0, y: 0, width: this.container.clientWidth, height: this.container.clientHeight }
      }
    );
    const mainViewCollection = this.initialiseViewCollection(true);
    const viewCollectionComp = mainViewCollection.getComponent(ViewCollection);
    viewCollectionComp.views.push(mainView);

    return mainViewCollection;
  }

  initialiseViewCollection(active) {
    const viewCollection = new Entity();
    viewCollection.addComponent(new ViewCollection(active));

    return viewCollection;
  }

  initialiseView({ viewId, sceneId, cameraId, viewport }) {
    const view = new Entity();
    view.addComponent(new View({ viewId, sceneId, cameraId, viewport }));

    return view;
  }

  initialiseViewRelatedObjects() {
    const sceneCollection = new Map();
    const cameraCollection = new Map();
    const viewCollections = new Map();

    sceneCollection.set("main", createScene());
    cameraCollection.set("main", createCamera());
    const mainViewCollection = this.initialiseMainViewCollection();
    viewCollections.set("main", mainViewCollection);

    // const sceneSystem = new SceneSystem(this.world, this.eventBus, sceneCollection);

    return [ sceneCollection, cameraCollection, mainViewCollection, viewCollections ];
  }

  initialiseLights() {
    const ambientLight = this.world.createEntity();
    ambientLight.addComponent(new ThreeLight({ colour: 0x808080, intensity: 0.8 }))
                .addComponent(new ThreeAmbientLight())
                .addComponent(new SceneAssignment([ "main" ]));
    const directionalLight = this.world.createEntity();
    directionalLight.addComponent(new ThreeLight({ color: 0xffffff, intensity: 1 }))
                    .addComponent(new ThreeDirectionalLight())
                    .addComponent(new ThreeDirectionalLightTarget())
                    .addComponent(new ThreeLightShadow())
                    .addComponent(new Transform(10, 10, 5))
                    .addComponent(new SceneAssignment([ "main" ]));

    const accentLight = this.world.createEntity();
    accentLight.addComponent(new ThreeLight({ color: 0x0066ff, intensity: 0.5 }))
               .addComponent(new ThreePointLight({ distance: 30 }))
               .addComponent(new Transform(-10, 5, 10))
               .addComponent(new SceneAssignment([ "main" ]));
    return [ ambientLight, directionalLight, accentLight ];
  }

  initializeManagers() {
    // Initialize Three.js scene
    // this.sceneManager = new SceneManager();

    // Initialize object management
    // this.objectManager = new ObjectManager(this.sceneManager);

    // Initialize OSC communication
    // this.oscManager = new OSCManager();
    this.oscSystem = new OSCSystem(this.world, this.eventBus);

    // Initialize UI management
    this.uiManager = new UIManager(this);

    // Connect managers
    // this.objectManager.setOSCManager(this.oscManager);
    // this.oscManager.setObjectManager(this.objectManager);
  }

  setupEventListeners(canvas, viewSystem, eventBus) {
    // Need to figure out where to put eventListeners that set the current view.

    // Canvas click events for object placement
    new ViewportClickHandler(canvas, viewSystem, eventBus);
    // Right click for object removal
    // this.sceneManager.canvas.addEventListener('contextmenu', (event) => {
    //   event.preventDefault();
    //   this.handleCanvasRightClick(event);
    // });

    // Handle window resize
    // window.addEventListener('resize', () => {
    //   this.sceneManager.handleWindowResize();
    // });
  }

  // handleCanvasClick(event) {
  //   const rect = this.sceneManager.canvas.getBoundingClientRect();
  //   const mouse = new THREE.Vector2(
  //     ((event.clientX - rect.left) / rect.width) * 2 - 1,
  //     -((event.clientY - rect.top) / rect.height) * 2 + 1
  //   );

  //   // Cast ray to find placement position
  //   const raycaster = new THREE.Raycaster();
  //   raycaster.setFromCamera(mouse, this.sceneManager.camera);

  //   // Place object at a fixed distance from camera if no intersection
  //   const direction = raycaster.ray.direction.clone();
  //   const distance = 10;
  //   const position = this.sceneManager.camera.position.clone()
  //                        .add(direction.multiplyScalar(distance));

  //   this.objectManager.createObject(this.selectedPrimitive, position);
  // }

  handleCanvasRightClick(event) {
    const rect = this.sceneManager.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.sceneManager.camera);

    const objects = this.objectManager.getSelectableObjects();
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.objectManager.removeObject(object.userData.id);
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.uiManager.updateModeDisplay();
    this.uiManager.updateUIForMode();
    console.log(`Mode changed to: ${mode}`);
  }

  setSelectedPrimitive(primitive) {
    this.selectedPrimitive = primitive;
    this.uiManager.updateSelectedPrimitive();
    console.log(`Selected primitive: ${primitive}`);
  }

  // animate() {
  //   requestAnimationFrame(() => this.animate());

  //   // Update object animations
  //   this.objectManager.update();

  //   // Update UI
  //   this.uiManager.update();

  //   // Render scene
  //   this.sceneManager.render();
  // }

}



// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
