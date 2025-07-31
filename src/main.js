import * as THREE from 'three';
import { OSCManager } from './osc_manager.js';
import { SceneManager } from './scene_manager.js';
import { UIManager } from './ui_manager.js';
import { ObjectManager } from './object_manager.js';

class App {
    constructor() {
        this.mode = 'user'; // 'user' or 'generative'
        this.selectedPrimitive = 'cube';
        
        this.initializeManagers();
        this.setupEventListeners();
        this.animate();
        
        console.log('Generative 3D Music App initialized');
    }

    initializeManagers() {
        // Initialize Three.js scene
        this.sceneManager = new SceneManager();
        
        // Initialize object management
        this.objectManager = new ObjectManager(this.sceneManager);
        
        // Initialize OSC communication
        this.oscManager = new OSCManager();
        
        // Initialize UI management
        this.uiManager = new UIManager(this);
        
        // Connect managers
        this.objectManager.setOSCManager(this.oscManager);
        this.oscManager.setObjectManager(this.objectManager);
    }

    setupEventListeners() {
        // Canvas click events for object placement
        this.sceneManager.canvas.addEventListener('click', (event) => {
            if (this.mode === 'user') {
                this.handleCanvasClick(event);
            }
        });

        // Right click for object removal
        this.sceneManager.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.handleCanvasRightClick(event);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.sceneManager.handleWindowResize();
        });
    }

    handleCanvasClick(event) {
        const rect = this.sceneManager.canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        // Cast ray to find placement position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.sceneManager.camera);

        // Place object at a fixed distance from camera if no intersection
        const direction = raycaster.ray.direction.clone();
        const distance = 10;
        const position = this.sceneManager.camera.position.clone()
            .add(direction.multiplyScalar(distance));

        this.objectManager.createObject(this.selectedPrimitive, position);
    }

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

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update object animations
        this.objectManager.update();
        
        // Update UI
        this.uiManager.update();
        
        // Render scene
        this.sceneManager.render();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
