import { Component } from "../core/component.js";

class OSCEmitter extends Component {
  constructor(address, params = {}) {
    super();
    if (!address) {
      throw new Error("A message address is required");
    }
    this.address = address;
    this.params = params;
    this.interval = 1000; // milliseconds
    this.lastEmit = 0;
    this.loop = true;
    this.enabled = true;
  }
}

export { OSCEmitter };
