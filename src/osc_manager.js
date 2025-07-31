import * as THREE from 'three';

export class OSCManager {
    constructor() {
        this.objectManager = null;
        this.messageCount = 0;
        this.isConnected = false;
        this.ws = null;
        this.reconnectInterval = null;
        this.reconnectDelay = 3000; // 3 seconds
        
        this.initializeWebSocket();
    }

    setObjectManager(objectManager) {
        this.objectManager = objectManager;
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
                case '/create/object':
                    this.handleCreateObject(args);
                    break;
                    
                case '/remove/object':
                    this.handleRemoveObject(args);
                    break;
                    
                case '/clear/all':
                    this.handleClearAll();
                    break;
                    
                case '/mode/set':
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
        if (!this.objectManager) return;
        
        // Expected args: [type, x, y, z]
        if (args.length >= 4) {
            const type = args[0];
            const position = new THREE.Vector3(args[1], args[2], args[3]);
            
            this.objectManager.createObjectFromOSC(type, position);
        }
    }

    handleRemoveObject(args) {
        if (!this.objectManager) return;
        
        // Expected args: [id]
        if (args.length >= 1) {
            const id = args[0];
            this.objectManager.removeObject(id);
        }
    }

    handleClearAll() {
        if (this.objectManager) {
            this.objectManager.clear();
        }
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

    sendMessage(address, data) {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not connected, cannot send message");
            return false;
        }

        try {
            // Convert data to flat arguments array
            const args = this.dataToArgs(data);
            
            const message = {
                type: 'osc-send',
                address: address,
                args: args
            };

            this.ws.send(JSON.stringify(message));
            this.messageCount++;
            
            console.log(`Sent OSC message to ${address}:`, args);
            return true;
            
        } catch (error) {
            console.error("Error sending OSC message:", error);
            return false;
        }
    }

    dataToArgs(data) {
        const args = [];
        
        if (typeof data === 'object' && data !== null) {
            // Convert object properties to flat array
            this.objectToArgs(data, args);
        } else {
            args.push(data);
        }
        
        return args;
    }

    objectToArgs(obj, args, prefix = '') {
        Object.entries(obj).forEach(([key, value]) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                this.objectToArgs(value, args, fullKey);
            } else if (Array.isArray(value)) {
                // Handle arrays by adding each element
                value.forEach((item, index) => {
                    if (typeof item === 'object' && item !== null) {
                        this.objectToArgs(item, args, `${fullKey}[${index}]`);
                    } else {
                        args.push(fullKey + `[${index}]`);
                        args.push(item);
                    }
                });
            } else {
                // Add key-value pair
                args.push(fullKey);
                args.push(value);
            }
        });
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