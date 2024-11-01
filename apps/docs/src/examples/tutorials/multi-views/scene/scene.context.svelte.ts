import { getContext, onDestroy, setContext } from "svelte";
import { Camera, Scene, Color } from "three";
import { useScenes } from "../canvas/exports.ts";
import { useCamera } from "@threlte/core";

class SceneContext {
   bbox = $state.raw() as DOMRect;
   count = $state.raw(0);
   #camera = $state<Camera>();

   #id: string;
   get id() {
      return this.#id;
   }

   #scene: Scene;
   get scene() {
      return this.#scene;
   }

   get container(): HTMLElement {
      return this.#scene.userData.element;
   }
   get camera() {
      return this.#camera!;
   }
   set camera(camera: Camera) {
      this.#scene.userData.camera = camera;
      this.#camera = camera;
   }

   constructor(sceneId: string, container: HTMLElement) {
      this.#id = sceneId;
      this.#scene = new Scene();
      container.style.position = "relative";
      container.style.zoom = "1";
      container.dataset.sceneId = sceneId;
      this.#scene.background = new Color(0xffffff);
      this.#scene.userData.element = container;
      this.bbox = container.getBoundingClientRect();
      console.log('>>>>>>', container, this.bbox);
   }
}

/**
 *  Following Context manages per scene
 *  Using symbols as keys ensure that keys will never conflict, but threlte is built in such a way
 *  that if we want to extend it, we need to use string as keys which can conflict.
 *  We don't have to worry about it till we are using a component tree using the same context twice.
 *  In our case anything inside Scene will always have same keys, but since Scenes can never be
 *  a child to each other, the keys will never conflict
 */

const SCENE_KEY = 'threlte-scene-context';
export const createSceneContext = (
   container: HTMLElement,
): SceneContext => {
   const scenesCtx = useScenes();
   const { camera } = useCamera(); // This provides the default camera;
   const sceneId = crypto.randomUUID();
   const context: SceneContext = new SceneContext(sceneId, container);
   context.camera = camera.current;

   scenesCtx.addScene(context, container);
   onDestroy(() => {
      scenesCtx.destroyScene(sceneId);
   })

   setContext<SceneContext>(SCENE_KEY, context);
   return context;
};

export const useScene = (): SceneContext => {
   const context = getContext<SceneContext>(SCENE_KEY);
   if (!context) {
      throw new Error(
         "useScene can only be used in a child component to <Scene>.",
      );
   }
   return context;
};


export type {
   SceneContext,
}
