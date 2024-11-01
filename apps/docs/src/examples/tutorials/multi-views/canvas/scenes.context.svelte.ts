import { getContext, onMount, setContext } from "svelte";
import type { SceneContext } from "../scene/exports.ts";

type Observer = ResizeObserver | MutationObserver;
class AllScenesContext {
   #listeners: Observer[] = [];
   #scenes = new Map<string, SceneContext>();
   get scenes() {
      return this.#scenes;
   }

   constructor () {
      this.#attachListeners();
   }

   #attachListeners () {
      /** Having single resize observer is better than multiple per scene individual observers */
      this.#listeners.push(new ResizeObserver((entries) => {
         for (const entry of entries) {
            const container = entry.target as HTMLElement | undefined;
            const scene$ = this.getScene(container?.dataset?.sceneId || "");
            if (!scene$ || !container) {
               return false;
            }
            scene$.bbox = container.getBoundingClientRect();
            scene$.count = 0;
         }
      }));
   }

   /**
    * For now I'm keeping my container non-reactive. We might later have to support reactive
    * containers, but that's if the project grows and we start adding support for multiple
    * Panes, even after that I guess keeping it non-reactive is fine.
    */
   addScene(ctx: SceneContext, container: HTMLElement) {
      this.#scenes.set(ctx.id, ctx);
      this.#listeners.forEach(o => o.observe(container));
      return ctx.scene;
   }

   getScene(id: string) {
      return this.#scenes.get(id);
   }

   destroyScene(id: string) {
      const sceneCtx = this.getScene(id);
      if (!sceneCtx) return;
      this.#listeners.forEach(o => {
         if ("unobserve" in o) {
            o.unobserve(sceneCtx.scene.userData.element);
         }
      });
      this.#scenes.delete(id);
   }

   destroy() {
      this.#listeners.forEach(o => o.disconnect());
   }
}

const SCENES_KEY = "threlte-multi-scene-context";
export const createScenesContext = (): AllScenesContext => {
   const context: AllScenesContext = new AllScenesContext();

   onMount(() => {
      return () => {
         context.destroy();
      }
   })

   setContext<AllScenesContext>(SCENES_KEY, context);
   return context;
};

export const useScenes = (): AllScenesContext => {
   const context = getContext<AllScenesContext>(SCENES_KEY);
   if (!context) {
      throw new Error(
         "useScenes can only be used in a child component to <Canvas>.",
      );
   }
   return context;
};

export type {
   AllScenesContext
}
