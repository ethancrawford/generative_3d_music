import debug from "debug";
import { System } from "../core/system.js";
import { OSCEmitter } from "../components/osc_emitter.js";
import { Transform } from "../components/transform.js";
import { ThreeMesh } from "../components/three_mesh.js";

const log = debug("app:oscSystem");
log.log = console.log.bind(console);

const error = debug("app:oscSystem:error");

class OSCSystem extends System {
  constructor(world, eventBus) {
    super(world);
    this.messageCount = 0;
    this.isConnected = false;
    this.ws = null;
    this.reconnectInterval = null;
    this.reconnectDelay = 3000; // 3 seconds
    this.eventBus = eventBus;

    this.initializeWebSocket();

  }

  static get requiredComponents() {
    return [OSCEmitter];
  }

  initializeWebSocket() {
    try {
      // Connect to the OSC bridge server
      this.ws = new WebSocket('ws://localhost:8081');

      this.ws.onopen = () => {
        log("WebSocket connection opened");
        this.isConnected = true;
        this.updateConnectionStatus();

        // Clear any reconnection attempts
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleIncomingMessage(message);
        } catch (err) {
           error("Error parsing WebSocket message:", err);
        }
      };

      this.ws.onclose = () => {
        log("WebSocket connection closed");
        this.isConnected = false;
        this.updateConnectionStatus();
        this.attemptReconnect();
      };

      this.ws.onerror = (err) => {
        error("WebSocket error:", err);
        this.isConnected = false;
        this.updateConnectionStatus();
      };

    } catch (err) {
      error("Failed to initialize WebSocket:", err);
      this.isConnected = false;
      this.updateConnectionStatus();
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectInterval) return; // Already attempting to reconnect

    log(`Attempting to reconnect in ${this.reconnectDelay / 1000} seconds...`);

    this.reconnectInterval = setInterval(() => {
      if (!this.isConnected) {
        log("Attempting WebSocket reconnection...");
        this.initializeWebSocket();
      }
    }, this.reconnectDelay);
  }

  handleIncomingMessage(message) {
    log("Received message from OSC bridge:", message);

    try {
      switch (message.type) {
      case 'connection':
        log('Bridge connection confirmed:', message.status);
        break;

      case 'osc-message':
        this.handleOSCMessage(message);
        break;

      case 'pong':
        log('Bridge pong received');
        break;

      default:
        log(`Unhandled message type: ${message.type}`, message);
      }
    } catch (err) {
      error("Error handling WebSocket message:", err);
    }
  }

  handleOSCMessage(message) {
    const { address, args } = message;

    try {
      switch (address) {
      case "/objects/single/create":
        this.handleCreateObject(args);
        break;

      case "/objects/single/remove":
        this.handleRemoveObject(args);
        break;

      case "/objects/all/remove":
        this.handleRemoveAll();
        break;

      case "/cameras/single/set":
        this.handleSetCamera(args);
        break;

      case "/mode/set":
        this.handleSetMode(args);
        break;

      default:
        log(`Unhandled OSC message: ${address}`, args);
      }
    } catch (err) {
      error("Error handling OSC message:", err);
    }
  }

  handleCreateObject(args) {
    // if (!this.objectManager) return;

    // Expected args: [type, x, y, z]
    if (args.length >= 4) {
      const type = args[0];
      const position = new THREE.Vector3(args[1], args[2], args[3]);
      this.eventBus.emit("objects:single:create", { type, position, generatedByOSC: true });
      // this.objectManager.createObjectFromOSC(type, position);
    }
  }

  handleRemoveObject(args) {
    // if (!this.objectManager) return;

    // Expected args: [id]
    if (args.length >= 1) {
      const id = args[0];
      this.eventBus.emit("objects:single:remove", { id });
    }
  }

  handleRemoveAll() {
    // if (this.objectManager) {
    //   this.objectManager.clear();
    // }
  }

  handleSetMode(args) {
      // Expected args: [mode] where mode is 'user' or 'generative'
      if (args.length >= 1 && window.app) {
          const mode = args[0];
          if (mode === 'user' || mode === 'generative') {
              window.app.setMode(mode);
          }
      }
  }

  handleSetView(args) {
    const viewCollection = args[0];
    const viewId = args[1];
    this.eventBus.emit("view:single:set", { viewCollection, view });
  }


  update(deltaTime) {
    const now = Date.now();

    for (const entity of this.entities) {
      const emitter = entity.getComponent(OSCEmitter);

      if (!emitter.enabled) continue;

      if (emitter.loop && now - emitter.lastEmit >= emitter.interval) {
        this.sendOSCMessage(entity, emitter);
        emitter.lastEmit = now;
      }
    }
  }

  sendOSCMessage(entity, emitter) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected, cannot send message");
      return false;
    }

    const transform = entity.getComponent(Transform);
    const meshComponent = entity.getComponent(ThreeMesh);
    let primitiveType;
    if (meshComponent && meshComponent.mesh) {
      primitiveType = meshComponent.mesh.geometry.type;
    }
    const message = {
      type: 'osc-send',
      address: emitter.address,
      args: [
        { type: 'i', value: entity.id },
        { type: 'f', value: transform ? transform.position.x : 0 },
        { type: 'f', value: transform ? transform.position.y : 0 },
        { type: 'f', value: transform ? transform.position.z : 0 },
        { type: 's', value: primitiveType ? primitiveType : 'unknown' },
        ...Object.entries(emitter.params).map(([key, value]) => ({
          type: typeof value === 'number' ? 'f' : 's',
          value: value
        }))
      ]
    };

    try {
      this.ws.send(JSON.stringify(message));
      this.messageCount++;
      this.eventBus.emit("osc:messages:count:changed", this.messageCount);

      log(`Sent OSC message to ${emitter.address}:`, message.args);
      return true;
    } catch (err) {
      error("Error sending OSC message:", err);
      return false;
    }
  }

  triggerOnce(entity) {
    const emitter = entity.getComponent(OSCEmitter);
    if (emitter && emitter.enabled) {
      this.sendOSCMessage(entity, emitter);
    }
  }


  updateConnectionStatus() {
    const statusElement = document.getElementById('osc-status');
    if (statusElement) {
      statusElement.className = `status-indicator ${this.isConnected ? 'connected' : ''}`;
    }
  }

  getMessageCount() {
    return this.messageCount;
  }

  isOSCConnected() {
    return this.isConnected;
  }

  // Send ping to test connection
  ping() {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'ping',
        timestamp: Date.now()
      }));
    }
  }

  // Clean shutdown
  close() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.ws) {
      this.ws.close();
    }
  }
}

export { OSCSystem };
