import { System } from "../core/system.js";
import { OSCEmitter } from "../components/osc_emitter.js";

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
        console.log("WebSocket connection opened");
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
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket connection closed");
        this.isConnected = false;
        this.updateConnectionStatus();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnected = false;
        this.updateConnectionStatus();
      };

    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      this.isConnected = false;
      this.updateConnectionStatus();
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectInterval) return; // Already attempting to reconnect

    console.log(`Attempting to reconnect in ${this.reconnectDelay / 1000} seconds...`);

    this.reconnectInterval = setInterval(() => {
      if (!this.isConnected) {
        console.log("Attempting WebSocket reconnection...");
        this.initializeWebSocket();
      }
    }, this.reconnectDelay);
  }

  handleIncomingMessage(message) {
    console.log("Received message from OSC bridge:", message);

    try {
      switch (message.type) {
      case 'connection':
        console.log('Bridge connection confirmed:', message.status);
        break;

      case 'osc-message':
        this.handleOSCMessage(message);
        break;

      case 'pong':
        console.log('Bridge pong received');
        break;

      default:
        console.log(`Unhandled message type: ${message.type}`, message);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
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
        console.log(`Unhandled OSC message: ${address}`, args);
      }
    } catch (error) {
      console.error("Error handling OSC message:", error);
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
    const primitiveType = entity.getComponent(PrimitiveType);

    const message = {
      type: 'osc-send',
      address: emitter.address,
      args: [
        { type: 'i', value: entity.id },
        { type: 'f', value: transform ? transform.position.x : 0 },
        { type: 'f', value: transform ? transform.position.y : 0 },
        { type: 'f', value: transform ? transform.position.z : 0 },
        { type: 's', value: primitiveType ? primitiveType.type : 'unknown' },
        ...Object.entries(emitter.params).map(([key, value]) => ({
          type: typeof value === 'number' ? 'f' : 's',
          value: value
        }))
      ]
    };

    try {
      this.ws.send(JSON.stringify(message));
      this.messageCount++;

      console.log(`Sent OSC message to ${address}:`, args);
      return true;
    } catch (error) {
      console.error("Error sending OSC message:", error);
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
