import { Component } from "../core/component.js";

class Rules extends Component {
  constructor() {
    super();
    this.affects = new Set(); // Entity IDs this affects
    this.affectedBy = new Set(); // Entity IDs that affect this
    this.rules = new Map(); // Rule name -> rule function
  }
}

export { Rules };
