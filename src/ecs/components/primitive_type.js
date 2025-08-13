import { Component } from "../core/component.js";

class PrimitiveType extends Component {
  constructor(type) {
    super();
    this.type = type; // 'cube', 'sphere', 'cylinder', etc.
    this.params = {}; // Type-specific parameters
  }
}

export { PrimitiveType };
