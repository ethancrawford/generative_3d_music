import { System } from "../core/system.js";
import { ViewCollection } from "../components/view_collection.js";
import { View } from "../components/view.js";

class ViewSystem extends System {
  constructor(world, eventBus, viewCollections) {
    super(world);
    this.viewCollections = viewCollections;

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

  addView(collectionEntity, viewEntity) {
    const collection = collectionEntity.getComponent(ViewCollection);
    if (collection) {
      collection.views.push(view);
      return view;
    }
  }

  addViews(collectionEntity, viewEntities) {
    const collection = collectionEntity.getComponent(ViewCollection);
    if (collection) {
      collection.views.push(...viewEntities);
      return collectionEntity;
    }
  }

  // getActiveViewCollection(entity) {
  //   const collection = entity.getComponent(ViewCollection);
  //   return collection;
  // }

  getViewsBySceneName(entity, sceneName) {
    const collection = entity.getComponent(ViewCollection);
    return collection ? collection.views.filter(view => view.sceneId === sceneName) : [];
  }

  getViewByCameraName(entity, cameraName) {
    const collection = entity.getComponent(ViewCollection);
    return collection ? collection.views.find(view => view.cameraId === cameraName) : null;
  }
}

export { ViewSystem };
