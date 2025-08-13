import * as THREE from 'three';

export class ObjectManager {
  constructor(eventBus, sceneManager) {
        this.sceneManager = sceneManager;
        // this.oscManager = null;
        
        this.objects = new Map(); // id -> object data
        this.nextId = 1;
        
        this.initializeMaterials();
    }

    // setOSCManager(oscManager) {
    //     this.oscManager = oscManager;
    // }

    initializeMaterials() {
        this.materials = {
            cube: new THREE.MeshLambertMaterial({ 
                color: 0xff6b6b,
                transparent: true,
                opacity: 0.8
            }),
            sphere: new THREE.MeshLambertMaterial({ 
                color: 0x4ecdc4,
                transparent: true,
                opacity: 0.8
            }),
            cylinder: new THREE.MeshLambertMaterial({ 
                color: 0x45b7d1,
                transparent: true,
                opacity: 0.8
            }),
            cone: new THREE.MeshLambertMaterial({ 
                color: 0xf9ca24,
                transparent: true,
                opacity: 0.8
            }),
            torus: new THREE.MeshLambertMaterial({ 
                color: 0xf0932b,
                transparent: true,
                opacity: 0.8
            })
        };
    }

    createGeometry(type) {
        const geometries = {
            cube: () => new THREE.BoxGeometry(2, 2, 2),
            sphere: () => new THREE.SphereGeometry(1.2, 32, 16),
            cylinder: () => new THREE.CylinderGeometry(1, 1, 2, 32),
            cone: () => new THREE.ConeGeometry(1, 2, 32),
            torus: () => new THREE.TorusGeometry(1, 0.4, 16, 100)
        };

        return geometries[type] ? geometries[type]() : geometries.cube();
    }

    createObject(type, position, generatedByOSC = false) {
        const id = this.nextId++;
        
        // Create geometry and material
        const geometry = this.createGeometry(type);
        const material = this.materials[type] || this.materials.cube;
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Add user data for identification
        mesh.userData = {
            id: id,
            type: type,
            createdAt: Date.now(),
            generatedByOSC: generatedByOSC
        };

        // Create object data
        const objectData = {
            id: id,
            type: type,
            mesh: mesh,
            position: position.clone(),
            createdAt: Date.now(),
            generatedByOSC: generatedByOSC,
            lastOSCMessage: 0,
            oscInterval: this.getOSCInterval(type),
            isActive: true
        };

        // Store object
        this.objects.set(id, objectData);
        
        // Add to scene
        this.sceneManager.addToScene(mesh);
        
        // Send initial OSC message
        this.sendOSCMessage(objectData);
        
        console.log(`Created ${type} object with ID ${id} at`, position);
        
        return objectData;
    }

    removeObject(id) {
        const objectData = this.objects.get(id);
        if (!objectData) return false;

        // Remove from scene
        this.sceneManager.removeFromScene(objectData.mesh);
        
        // Clean up geometry and material if needed
        objectData.mesh.geometry.dispose();
        
        // Remove from our tracking
        this.objects.delete(id);
        
        // Send removal OSC message
        // if (this.oscManager) {
            this.oscManager.sendMessage('/object/removed', {
                id: id,
                type: objectData.type,
                position: objectData.position
            });
        }
        
        console.log(`Removed object with ID ${id}`);
        return true;
    }

    getOSCInterval(type) {
        // Different object types send OSC messages at different intervals (in ms)
        const intervals = {
            cube: 1000,      // 1 second
            sphere: 750,     // 0.75 seconds
            cylinder: 1250,  // 1.25 seconds
            cone: 500,       // 0.5 seconds
            torus: 2000      // 2 seconds
        };
        
        return intervals[type] || 1000;
    }

    sendOSCMessage(objectData) {
        if (!this.oscManager) return;

        const now = Date.now();
        
        // Check if enough time has passed since last message
        if (now - objectData.lastOSCMessage < objectData.oscInterval) {
            return;
        }

        const message = {
            id: objectData.id,
            type: objectData.type,
            position: {
                x: objectData.mesh.position.x,
                y: objectData.mesh.position.y,
                z: objectData.mesh.position.z
            },
            age: now - objectData.createdAt,
            nearbyObjects: this.getNearbyObjects(objectData, 5) // Objects within 5 units
        };

        this.oscManager.sendMessage('/object/update', message);
        objectData.lastOSCMessage = now;
    }

    getNearbyObjects(targetObject, maxDistance) {
        const nearby = [];
        const targetPos = targetObject.mesh.position;

        for (const [id, obj] of this.objects) {
            if (id === targetObject.id) continue;
            
            const distance = targetPos.distanceTo(obj.mesh.position);
            if (distance <= maxDistance) {
                nearby.push({
                    id: id,
                    type: obj.type,
                    distance: distance
                });
            }
        }

        return nearby;
    }

    update() {
        // Update all objects and send OSC messages as needed
        for (const [id, objectData] of this.objects) {
            if (!objectData.isActive) continue;

            // Add subtle floating animation
            const time = Date.now() * 0.001;
            const originalY = objectData.position.y;
            objectData.mesh.position.y = originalY + Math.sin(time + id) * 0.1;

            // Gentle rotation
            objectData.mesh.rotation.y += 0.005;
            
            // Send periodic OSC messages
            this.sendOSCMessage(objectData);
        }
    }

    getObjectCount() {
        return this.objects.size;
    }

    getSelectableObjects() {
        return Array.from(this.objects.values()).map(obj => obj.mesh);
    }

    // Method for OSC-triggered object creation
    createObjectFromOSC(type, position) {
        return this.createObject(type, position, true);
    }

    // Get all objects data for rules engine (Phase 2)
    getAllObjects() {
        return Array.from(this.objects.values());
    }

    // Clear all objects
    clear() {
        for (const [id] of this.objects) {
            this.removeObject(id);
        }
    }
}
