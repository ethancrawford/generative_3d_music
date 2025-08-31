import { WebSocketServer } from 'ws';
import osc from 'osc';

class OSCBridge {
    constructor() {
        this.wsPort = 8081;
        this.oscInPort = 8080;  // Port to receive OSC messages
        this.oscOutPort = 8082; // Port to send OSC messages
        this.oscOutAddress = '127.0.0.1';
        
        this.clients = new Set();
        this.initializeWebSocketServer();
        this.initializeOSCPort();
        
        console.log('OSC Bridge Server starting...');
        console.log(`WebSocket server on port ${this.wsPort}`);
        console.log(`OSC listening on port ${this.oscInPort}`);
        console.log(`OSC sending to ${this.oscOutAddress}:${this.oscOutPort}`);
    }

    initializeWebSocketServer() {
      const options = {
        port: this.wsPort,
        perMessageDeflate: false
      };
      console.log('WebSocket options:', options);
        this.wss = new WebSocketServer(options);

        this.wss.on('connection', (ws) => {
            console.log('Client connected to WebSocket');
            this.clients.add(ws);

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected from WebSocket');
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });

            // Send connection confirmation
            this.sendToClient(ws, {
                type: 'connection',
                status: 'connected',
                timestamp: Date.now()
            });
        });

        console.log(`WebSocket server listening on port ${this.wsPort}`);
    }

    initializeOSCPort() {
        // Create UDP port for OSC communication
        this.oscPort = new osc.UDPPort({
            localAddress: '0.0.0.0',
            localPort: this.oscInPort,
            metadata: true
        });

        // Handle incoming OSC messages
        this.oscPort.on('message', (oscMessage, timeTag, info) => {
            console.log('Received OSC message:', oscMessage.address, oscMessage.args);
            
            // Forward OSC message to all WebSocket clients
            this.broadcastToClients({
                type: 'osc-message',
                address: oscMessage.address,
                args: oscMessage.args.map(arg => arg.value || arg),
                timestamp: Date.now(),
                from: info
            });
        });

        this.oscPort.on('ready', () => {
            console.log(`OSC UDP port ready, listening on port ${this.oscInPort}`);
        });

        this.oscPort.on('error', (error) => {
            console.error('OSC UDP port error:', error);
        });

        // Open the port
        this.oscPort.open();
    }

    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'osc-send':
                this.sendOSCMessage(message.address, message.args || []);
                break;
                
            case 'ping':
                this.broadcastToClients({
                    type: 'pong',
                    timestamp: Date.now()
                });
                break;
                
            default:
                console.log('Unknown WebSocket message type:', message.type);
        }
    }

    sendOSCMessage(address, args) {
        try {
            // Convert args to OSC format
            const oscArgs = args.map(arg => {
                if (typeof arg === 'object' && arg.type && arg.value !== undefined) {
                    return arg; // Already in OSC format
                }
                
                // Auto-detect type
                if (typeof arg === 'number') {
                    return Number.isInteger(arg) ? 
                        { type: 'i', value: arg } : 
                        { type: 'f', value: arg };
                } else if (typeof arg === 'string') {
                    return { type: 's', value: arg };
                } else if (typeof arg === 'boolean') {
                    return { type: 'i', value: arg ? 1 : 0 };
                } else {
                    return { type: 's', value: String(arg) };
                }
            });

            const oscMessage = {
                address: address,
                args: oscArgs
            };

            // Send via UDP to external OSC application
            this.oscPort.send(oscMessage, this.oscOutAddress, this.oscOutPort);
            
            console.log(`Sent OSC message to ${this.oscOutAddress}:${this.oscOutPort}`, 
                       address, oscArgs.map(a => a.value));
                       
        } catch (error) {
            console.error('Error sending OSC message:', error);
        }
    }

    sendToClient(client, message) {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error sending to WebSocket client:', error);
            }
        }
    }

    broadcastToClients(message) {
        this.clients.forEach(client => {
            this.sendToClient(client, message);
        });
    }

    close() {
        console.log('Closing OSC Bridge Server...');
        
        if (this.oscPort) {
            this.oscPort.close();
        }
        
        if (this.wss) {
            this.wss.close();
        }
    }
}

// Create and start the bridge
const bridge = new OSCBridge();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    bridge.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    bridge.close();
    process.exit(0);
});

export { OSCBridge };
