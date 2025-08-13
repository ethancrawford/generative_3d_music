import { Clock } from "three";
import { Component } from "../core/component.js";

class ThreeClock extends Component {
  constructor() {
    super();
    this.clock = new Clock();
  }
}

export { ThreeClock };
