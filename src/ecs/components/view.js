import { Component } from "../core/component.js";

class View extends Component {
  constructor(args) {
    super();
    const { viewId, sceneId, cameraId, viewport } = args;
    this.id = viewId;
    this.sceneId = sceneId;
    this.cameraId = cameraId;
    this.viewport = viewport;
    this.renderOrder = 0;
  }
}
export { View };
