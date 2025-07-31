# Generative 3D Music

An interactive generative 3D art project that creates visual compositions while sending OSC messages to external music systems.

## Architecture

The project uses a **WebSocket bridge server** to handle OSC communication between the browser and external applications:

- **Browser Client**: Three.js 3D interface that communicates via WebSocket
- **Node.js Bridge Server**: Handles bidirectional OSC ↔ WebSocket translation
- **External OSC Applications**: Music software that receives/sends OSC messages

```
Browser (WebSocket) ↔ Bridge Server ↔ External App (OSC UDP)
```

## Features

- **Dual Mode Operation**: Switch between user-controlled and generative object placement
- **3D Primitives**: Cube, Sphere, Cylinder, Cone, and Torus objects
- **OSC Integration**: Bidirectional OSC communication via WebSocket bridge
- **Real-time Interaction**: Click to place objects, right-click to remove
- **Dynamic Messaging**: Objects send periodic OSC messages based on their properties and relationships
- **Auto-reconnection**: Automatic WebSocket reconnection if bridge server restarts

## Setup

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- A modern web browser

### Installation

1. Clone or download the project files
2. Install dependencies:
   ```bash
   yarn install
   ```
   
   **Note**: This project is configured to use `node-modules` instead of Yarn PnP for better compatibility with build tools and IDEs. The configuration is set in `.yarnrc.yml`.

### Development

1. Start the development server (runs both the build watcher and OSC bridge):
   ```bash
   yarn dev
   ```

2. In a separate terminal, serve the application:
   ```bash
   yarn serve
   ```

3. Open your browser to `http://localhost:8000`

The development server will automatically:
- Compile Sass files from `src/styles/` to `dist/styles.css`
- Bundle JavaScript files to `dist/bundle.js`
- Watch for changes and recompile automatically
- Run the OSC bridge server on WebSocket port 8081

### Running Components Separately

If you need to run components individually:

```bash
# Build and watch files only
node build.js --watch

# Run OSC bridge server only
yarn server

# Serve static files
yarn serve
```

### Production Build

```bash
yarn build
```

## Usage

### Controls

- **Left Click**: Place the selected primitive object
- **Right Click**: Remove an object
- **Middle Mouse + Drag**: Rotate camera view
- **Mouse Wheel**: Zoom in/out
- **Mode Toggle**: Switch between User and Generative modes

### User Mode
- Click primitive buttons to select object type
- Click in the 3D space to place objects
- Objects will automatically send OSC messages

### Generative Mode
- Objects are created automatically in response to incoming OSC messages
- Manual object placement is disabled

## OSC Integration

### Architecture
The OSC bridge server handles communication between the browser and external OSC applications:

- **WebSocket Port**: 8081 (browser ↔ bridge)
- **OSC Input Port**: 8080 (receives from external apps)
- **OSC Output Port**: 8082 (sends to external apps)
- **Address**: 127.0.0.1 (localhost)

### External OSC Application Setup
Configure your music software to:
- **Send OSC to**: `127.0.0.1:8080` (bridge will receive and forward to browser)
- **Receive OSC from**: `127.0.0.1:8082` (bridge will send messages from browser)

### Outgoing Messages

#### `/object/update`
Sent periodically by each object with:
- `id`: Unique object identifier
- `type`: Object primitive type
- `position`: x, y, z coordinates
- `age`: Time since object creation
- `nearbyObjects`: Array of nearby objects within 5 units

#### `/object/removed`
Sent when an object is removed with:
- `id`: Object identifier
- `type`: Object type
- `position`: Last known position

### Incoming Messages

#### `/create/object`
Create a new object:
- Args: `[type, x, y, z]`
- Example: `[sphere, 1.0, 2.0, 3.0]`

#### `/remove/object`
Remove an object by ID:
- Args: `[id]`
- Example: `[5]`

#### `/clear/all`
Remove all objects (no arguments)

#### `/mode/set`
Change the application mode:
- Args: `[mode]`
- Example: `[generative]` or `[user]`

## Project Structure

```
├── src/
│   ├── main.js           # Application entry point
│   ├── scene-manager.js  # Three.js scene management
│   ├── object-manager.js # 3D object lifecycle management
│   ├── osc-manager.js    # WebSocket OSC communication
│   ├── ui-manager.js     # User interface management
│   └── styles/
│       └── main.scss     # Main Sass stylesheet
├── server/
│   └── osc-bridge.js     # OSC ↔ WebSocket bridge server
├── dist/                 # Built files (generated)
│   ├── bundle.js         # Compiled JavaScript
│   └── styles.css        # Compiled CSS
├── index.html            # Main HTML file
├── build.js              # Build configuration (esbuild + Sass)
├── package.json          # Project dependencies
├── .yarnrc.yml           # Yarn configuration file
├── .gitignore            # Git ignore file
└── README.md             # This file
```

## Next Steps (Phase 2)

- Rules engine for object interactions
- Visual rule editor interface
- Advanced object relationships
- Performance optimizations
- Object combination system

## Technical Notes

- Built with modern ES6+ JavaScript
- Uses Three.js for 3D rendering
- OSC communication via osc.js library
- Styling with Sass (SCSS syntax)
- Build system powered by esbuild + Sass compiler
- Responsive design with CSS Grid and Flexbox
- No external CSS frameworks (custom Sass architecture)

## Troubleshooting

### OSC Bridge Connection Issues
- Ensure the bridge server is running (`yarn dev` or `yarn server`)
- Check that ports 8080, 8081, and 8082 are not in use by other applications
- Verify firewall settings allow local network access
- Look for bridge server logs in the terminal for connection status

### WebSocket Connection Issues
- Browser console will show "WebSocket connection opened" when successful
- Red status indicator means WebSocket is disconnected
- Green pulsing indicator means connected and ready
- The system will automatically attempt to reconnect every 3 seconds

### External OSC Application Setup
- Configure your music software to send OSC to `127.0.0.1:8080`
- Configure your music software to receive OSC from `127.0.0.1:8082`
- Test OSC communication with tools like OSC Monitor or TouchOSC

### Performance
- Reduce the number of objects if experiencing lag
- Consider adjusting OSC message intervals in `object-manager.js`
- Monitor browser developer console and bridge server terminal for errors

### Common Error Messages
- **"WebSocket connection failed"**: Bridge server not running
- **"Could not resolve dgram"**: Old browser-direct OSC code (should be fixed with WebSocket approach)
- **"EADDRINUSE"**: Port already in use, close other applications using OSC ports
