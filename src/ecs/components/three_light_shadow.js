import { Component } from "../core/component.js";

class ThreeLightShadow extends Component {
  constructor({ shadow } = {}) {
    super();
    // if (shadow != undefined) {
      this.shadow = shadow;
    // } else {
    //   this.shadow = {
    //     mapSize: { width: 2048, height: 2048 },
    //     camera: { near: 0.5, far: 50, left: -20, right: 20, top: 20, bottom: -20 },
    //   }
    // }
  }
}

export { ThreeLightShadow };
