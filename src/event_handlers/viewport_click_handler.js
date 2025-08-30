import { Raycaster, Vector2 } from "three";

class ViewportClickHandler {
  constructor(canvas, viewSystem, eventBus) {
    this.canvas = canvas;
    this.viewSystem = viewSystem;
    this.raycaster = new Raycaster();
    this.eventBus = eventBus;

    canvas.addEventListener('click', (event) => this.handleClick(event));
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedViewComponent = this.viewSystem.getViewComponentFromMouseClick(x, y);
    if (clickedViewComponent) {
      this.placeObjectInView(clickedViewComponent, x, y);
    }
  }

  placeObjectInView(viewComponent, clickX, clickY) {
    // Convert to normalized coordinates within this specific viewport
    const normalizedX = ((clickX - viewComponent.viewport.x) / viewComponent.viewport.width) * 2 - 1;
    const normalizedY = -((clickY - viewComponent.viewport.y) / viewComponent.viewport.height) * 2 + 1;
    const camera = this.viewSystem.getCameraFromViewComponent(viewComponent);

    this.raycaster.setFromCamera(new Vector2(normalizedX, normalizedY), camera);
    // Place primitive at raycast hit point or fixed distance...

    const direction = this.raycaster.ray.direction.clone();
    const distance = 10;
    const position = camera.position.clone()
                           .add(direction.multiplyScalar(distance));

    // create object primitive at position
    this.eventBus.emit("objects:single:create", { type: "cube", args: { position, generatedByOSC: false } });
    console.log("placing primitive at position:", position);
  }
}

export { ViewportClickHandler };
