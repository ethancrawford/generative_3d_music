import { Component } from "../core/component.js";

class ThreeDirectionalLight extends Component {
  constructor({ castShadow = false } = {}) {
    super();
    this.castShadow = castShadow;
  }
}

export { ThreeDirectionalLight };
