import { Component } from "../core/component.js";

class ThreeLight extends Component {
  constructor({ colour, intensity }) {
    super();
    this.color = colour;
    this.intensity = intensity;
    this.light = null; // Will hold the Three.js light
  }
}

export { ThreeLight };
