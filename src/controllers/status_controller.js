import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["objectCount", "messageCount", "oscStatus"]
  static values = {
    objectCount: Number,
    messageCount: Number,
    oscConnected: Boolean
  }

  connect() {
    this.eventBus = window.app.eventBus;

    this.eventBus.subscribe("objects:count:changed", (count) => {
      this.objectCountValue = count;
    });

    this.eventBus.subscribe("osc:messages:count:changed", (count) => {
      this.messageCountValue = count;
    });

    this.eventBus.subscribe("osc:status:changed", (connected) => {
      this.oscConnectedValue = connected;
    });
  }

  objectCountValueChanged() {
    if (this.hasObjectCountTarget) {
      this.objectCountTarget.textContent = this.objectCountValue;
    }
  }

  messageCountValueChanged() {
    if (this.hasMessageCountTarget) {
      this.messageCountTarget.textContent = this.messageCountValue;
    }
  }

  oscConnectedValueChanged() {
    if (this.hasOscStatusTarget) {
      this.oscStatusTarget.className = `status-indicator ${this.oscConnectedValue ? "connected": ""}`;
    }
  }
}
