import * as THREE from 'three';

export class SceneManager {
    constructor() {
        // this.initializeScene();
        // this.initializeRenderer();
        // this.initializeCamera();
        this.initializeLighting();
        this.initializeControls();
        
        // Add canvas to container
        // const container = document.getElementById('canvas-container');
        // container.appendChild(this.renderer.domElement);
        // this.canvas = this.renderer.domElement;
    }

    // initializeScene() {
    //     this.scene = new THREE.Scene();
    //     this.scene.background = new THREE.Color(0x0a0a0a);
        
    //     // Add a subtle fog for depth
    //     this.scene.fog = new THREE.Fog(0x0a0a0a, 20, 100);
    // }

    // initializeRenderer() {
    //     this.renderer = new THREE.WebGLRenderer({ 
    //         antialias: true,
    //         powerPreference: "high-performance"
    //     });
    //     this.renderer.setSize(window.innerWidth, window.innerHeight);
    //     this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    //     this.renderer.shadowMap.enabled = true;
    //     this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //     this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // }

    // initializeCamera() {
    //     this.camera = new THREE.PerspectiveCamera(
    //         75, 
    //         window.innerWidth / window.innerHeight, 
    //         0.1, 
    //         1000
    //     );
    //     this.camera.position.set(0, 10, 20);
    //     this.camera.lookAt(0, 0, 0);
    // }

    initializeLighting() {
        // Ambient light for overall illumination
        // const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Main directional light
        // const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        // directionalLight.position.set(10, 10, 5);
        // directionalLight.castShadow = true;
        // directionalLight.shadow.mapSize.width = 2048;
        // directionalLight.shadow.mapSize.height = 2048;
        // directionalLight.shadow.camera.near = 0.5;
        // directionalLight.shadow.camera.far = 50;
        // directionalLight.shadow.camera.left = -20;
        // directionalLight.shadow.camera.right = 20;
        // directionalLight.shadow.camera.top = 20;
        // directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);

        // Accent light for visual interest
        // const accentLight = new THREE.PointLight(0x0066ff, 0.5, 30);
        // accentLight.position.set(-10, 5, 10);
        this.scene.add(accentLight);

        // Store lights for potential future manipulation
        this.lights = {
            ambient: ambientLight,
            directional: directionalLight,
            accent: accentLight
        };
    }

    initializeControls() {
        // Simple mouse controls for camera rotation
        this.mouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.cameraAngleX = 0;
        this.cameraAngleY = 0;
        this.cameraDistance = 25;

        this.canvas = null; // Will be set after renderer is added to DOM

        // Add control event listeners once canvas is available
        setTimeout(() => {
            this.setupControlEvents();
        }, 0);
    }

    setupControlEvents() {
        if (!this.canvas) return;

        // Mouse controls
        this.canvas.addEventListener('mousedown', (event) => {
            if (event.button === 1) { // Middle mouse button
                this.mouseDown = true;
                this.mouseX = event.clientX;
                this.mouseY = event.clientY;
            }
        });

        document.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        document.addEventListener('mousemove', (event) => {
            if (this.mouseDown) {
                const deltaX = event.clientX - this.mouseX;
                const deltaY = event.clientY - this.mouseY;

                this.cameraAngleX += deltaY * 0.01;
                this.cameraAngleY += deltaX * 0.01;

                // Clamp vertical rotation
                this.cameraAngleX = Math.max(-Math.PI/2 + 0.1, 
                    Math.min(Math.PI/2 - 0.1, this.cameraAngleX));

                this.updateCameraPosition();

                this.mouseX = event.clientX;
                this.mouseY = event.clientY;
            }
        });

        // Zoom with mouse wheel
        this.canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.cameraDistance += event.deltaY * 0.01;
            this.cameraDistance = Math.max(5, Math.min(50, this.cameraDistance));
            this.updateCameraPosition();
        }, { passive: false });
    }

    updateCameraPosition() {
        const x = this.cameraDistance * Math.sin(this.cameraAngleY) * Math.cos(this.cameraAngleX);
        const y = this.cameraDistance * Math.sin(this.cameraAngleX);
        const z = this.cameraDistance * Math.cos(this.cameraAngleY) * Math.cos(this.cameraAngleX);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }

    handleWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    // Helper methods for adding/removing objects
    addToScene(object) {
        this.scene.add(object);
    }

    removeFromScene(object) {
        this.scene.remove(object);
    }
}
