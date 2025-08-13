import { Component } from "../core/component.js";

class ThreeDirectionalLightTarget extends Component {
  constructor(x = 0, y = 0, z = 0) {
    super();
    this.target = { x, y, z };
  }
}

export { ThreeDirectionalLightTarget };
