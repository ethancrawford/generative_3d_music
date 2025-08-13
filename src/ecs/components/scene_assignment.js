import { Component } from "../core/component.js";

class SceneAssignment extends Component {
  constructor(sceneIds = []) {
    super();
    this.sceneIds = sceneIds; // Empty = all scenes, or specific scene IDs
  }
}

export { SceneAssignment };
