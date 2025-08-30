import { System } from "../core/system.js";
import { ViewCollection } from "../components/view_collection.js";
import { View } from "../components/view.js";

class ViewSystem extends System {
  constructor(world, eventBus, sceneCollection, cameraCollection, viewCollections) {
    super(world);
    this.viewCollections = viewCollections;
    this.sceneCollection = sceneCollection;
    this.cameraCollection = cameraCollection;

    eventBus.subscribe("view-collections:all:get", () => {
      this.eventBus.emit("view-collections:all:get-response", { viewCollections: this.viewCollections });
    });
  }

  static get requiredComponents() {
    return [ ViewCollection, View ];
  }

  addViewCollectionAndViews(collectionName, collectionEntity, viewEntities) {
    const viewCollection = this.addViews(collectionEntity, viewEntities)
    this.viewCollections.set(collectionName, viewCollection)
  }

  addViewCollection(collectionName, collectionEntity) {
    this.viewCollections.set(collectionName, collectionEntity)
  }

  addViews(collectionEntity, viewEntities) {
    const collection = collectionEntity.getComponent(ViewCollection);
    if (collection) {
      collection.views.push(...viewEntities);
      return collectionEntity;
    }
  }

  getActiveViewCollection() {
    return Array.from(this.viewCollections, ([ id, viewCollection ]) => ({ id, viewCollection })).find(({ viewCollection }) => {
      const viewCollectionComp = viewCollection.getComponent(ViewCollection);
      return viewCollectionComp.active;
    });
  }

  getActiveViews() {
    const { viewCollection } = this.getActiveViewCollection();
    const collectionComp = viewCollection.getComponent(ViewCollection);
    return collectionComp.views;
  }

  getViewsBySceneName(entity, sceneName) {
    const collection = entity.getComponent(ViewCollection);
    return collection ? collection.views.filter(view => view.sceneId === sceneName) : [];
  }

  getViewByCameraName(entity, cameraName) {
    const collection = entity.getComponent(ViewCollection);
    return collection ? collection.views.find(view => view.cameraId === cameraName) : null;
  }

  getCameraFromViewComponent(viewComponent) {
    return this.cameraCollection.get(viewComponent.cameraId);
  }

  isPointInViewport(x, y, viewport) {
    return x >= viewport.x && x <= viewport.x + viewport.width &&
           y >= viewport.y && y <= viewport.y + viewport.height;
  }

  getViewComponentFromMouseClick(x, y) {
    const activeViews = this.getActiveViews();
    const clickedView = activeViews.find(view => {
      const viewComp = view.getComponent(View);
      return this.isPointInViewport(x, y, viewComp.viewport)
    });
    return clickedView ? clickedView.getComponent(View) : null;
  }

  sceneById(sceneId) {
    return this.sceneCollection.get(sceneId)
  }

  getScenesFromViewCollection(viewCollection) {
    const viewCollectionComp = viewCollection.getComponent(ViewCollection);
    return viewCollectionComp.views.map((view) => {
      const viewComp = view.getComponent(View);
      return this.sceneById(viewComp.sceneId)
    });
  }

  cameraById(cameraId) {
    return this.cameraCollection.get(cameraId)
  }
}

export { ViewSystem };
