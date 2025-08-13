import { Component } from "../core/component.js";

class ThreeMesh extends Component {
  constructor(geometry, material) {
    super();
    this.geometry = geometry;
    this.material = material;
    this.mesh = null; // Will hold the Three.js mesh
  }
}

export { ThreeMesh };
