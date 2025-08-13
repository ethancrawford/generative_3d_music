import { Component } from "../core/component.js";

class Transform extends Component {
  constructor(x = 0, y = 0, z = 0) {
    super();
    this.position = { x, y, z };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
  }
}

export { Transform };
