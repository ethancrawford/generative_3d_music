import { Component } from "../core/component.js";

class ThreePointLight extends Component {
  constructor({ distance, decay, castShadow }) {
    super();
    this.distance = distance;
    this.decay = decay;
    this.castShadow = castShadow;
  }
}

export { ThreePointLight };
