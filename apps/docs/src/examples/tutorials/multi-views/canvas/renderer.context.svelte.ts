import { getContext, onDestroy, setContext } from 'svelte';
import {
   AgXToneMapping,
   type ColorSpace,
   PCFSoftShadowMap,
   type Renderer,
   type ShadowMapType,
   type ToneMapping,
   WebGLRenderer,
   ColorManagement
} from 'three';
import {
   useScheduler,
   type Task,
   createRendererContext as RendererCtxFn,
   useCanvas,
   isInstanceOf,
   type CurrentReadable,
   type Size,
   watch,
   useDisposal,
   useTask
} from '@threlte/core';
import { useScenes } from './scenes.context.svelte';
import type { SceneContext } from '../scene/exports';

export type ThrelteRendererOptions = Parameters<typeof RendererCtxFn>[0];
type ThrelteRendererContext = {
   renderer: Renderer;
   autoRenderTask: Task;
} & Omit<ThrelteRendererOptions, 'createRenderer'>;

/**
 * RendererContext should be a superset of Threlte's RendererContext for things to work correctly.
 */
class RendererContext {
   colorManagementEnabled = $state<boolean>(true);
   colorSpace = $state<ColorSpace>()!;
   toneMapping = $state<ToneMapping>()!;
   shadows = $state<boolean | ShadowMapType>()!;
   dpr = $state<number>(1);
   autoRenderTask: Task;

   #renderer: Renderer;
   get renderer() {
      return this.#renderer;
   }

   constructor(ctx: ThrelteRendererContext) {
      this.#renderer = ctx.renderer;
      this.colorManagementEnabled = ctx.colorManagementEnabled ?? true;
      this.colorSpace = ctx.colorSpace ?? 'srgb';
      this.toneMapping = ctx.toneMapping ?? AgXToneMapping;
      this.shadows = ctx.shadows ?? PCFSoftShadowMap;
      this.dpr = ctx.dpr ?? globalThis.devicePixelRatio ?? 1;
      this.autoRenderTask = ctx.autoRenderTask;
   }
}

export const isWebGLRenderer = (renderer: Renderer): renderer is WebGLRenderer => {
   return isInstanceOf(renderer, 'WebGLRenderer' as any);
};

const isSceneOOB = (
   bbox: { top: number; right: number; bottom: number; left: number },
   canvasSize: { width: number; height: number }
) => {
   const { top, right, bottom, left } = bbox;
   return bottom < 0 || top > canvasSize.height || right < 0 || left > canvasSize.width;
};

const animateScene = (scene$: SceneContext, renderer: Renderer, size: CurrentReadable<Size>) => {
   if (!scene$.scene || !scene$.camera) return;

   // Accessing Proxies can be ~50x slower compared to accessing POJOs at-times
   // Ref: https://www.measurethat.net/Benchmarks/ShowResult/563658
   // If performance becomes a bottleneck when rendering multiple scenes for us,
   // we can convert these signals into POJO with `.current` property to access the latest state
   // without affecting the performance.
   //
   // TODO: Till I don't see any performance issues, I'll defer working a way to access
   // current state using `.current` in getters, rather than accessing the proxy directly.
   // To reduce code complexity: https://discord.com/channels/457912077277855764/1059917031295680562/1301812304215539747
   const { top, right, bottom, left, width, height } = scene$.bbox;
   const canvasSize = size.current;
   const isOOB = isSceneOOB({ top, right, bottom, left }, canvasSize);
   if (isOOB) {
      return;
   }

   const viewportBottom = canvasSize.height - bottom;
   if (isWebGLRenderer(renderer)) {
      renderer.setViewport(left, viewportBottom, width, height);
      renderer.setScissor(left, viewportBottom, width, height);
   }
   renderer.render(scene$.scene, scene$.camera);
};

const CTX_KEY = 'threlte-renderer-context';
export const createRendererContext = (options: ThrelteRendererOptions): RendererContext => {
   const { dispose } = useDisposal();
   const { invalidate, renderStage, autoRender, scheduler, resetFrameInvalidation } =
      useScheduler();
   const scenes$ = useScenes();
   const { canvas, size } = useCanvas();
   const { createRenderer, ...props } = options;

   const renderer = options.createRenderer
      ? options.createRenderer(canvas)
      : new WebGLRenderer({
           canvas,
           powerPreference: 'high-performance',
           antialias: true,
           alpha: true
        });
   const autoRenderTask = renderStage.createTask(Symbol('threlte-auto-render-task'), () => {
      for (const [_, scene$] of scenes$.scenes) {
         animateScene(scene$, renderer, size);
      }
   });

   const context = new RendererContext({
      renderer,
      autoRenderTask,
      ...props
   });
   setContext<RendererContext>(CTX_KEY, context);

   // Resize the renderer when the size changes
   const { start, stop } = useTask(
      () => {
         // if (!('xr' in renderer) || renderer.xr?.isPresenting) return;
         renderer.setSize(size.current.width, size.current.height);
         invalidate();
         stop();
      },
      {
         before: autoRenderTask,
         autoStart: false,
         autoInvalidate: false
      }
   );
   watch([size], () => {
      start();
   });

   $effect(() => {
      ColorManagement.enabled = context.colorManagementEnabled;
      if (!isWebGLRenderer(renderer)) return;

      renderer.outputColorSpace = context.colorSpace;
      renderer.setPixelRatio(context.dpr);
      renderer.toneMapping = context.toneMapping;
      const shadows = context.shadows;
      renderer.shadowMap.enabled = !!shadows;
      if (shadows && shadows !== true) {
         renderer.shadowMap.type = shadows;
      } else if (shadows === true) {
         renderer.shadowMap.type = PCFSoftShadowMap;
      }
   });

   watch([autoRender], ([autoRender]) => {
      if (autoRender) {
         context.autoRenderTask.start();
      } else {
         context.autoRenderTask.stop();
      }
      return () => {
         context.autoRenderTask.stop();
      };
   });

   watch([autoRender], ([autoRender]) => {
      if (autoRender) {
         context.autoRenderTask.start();
      } else {
         context.autoRenderTask.stop();
      }
      return () => {
         context.autoRenderTask.stop();
      };
   });

   if ('setAnimationLoop' in context.renderer) {
      const renderer = context.renderer as WebGLRenderer;
      renderer.setAnimationLoop((time) => {
         dispose();
         scheduler.run(time);
         resetFrameInvalidation();
      });
   }

   onDestroy(() => {
      if ('dispose' in context.renderer) {
         const dispose = context.renderer.dispose as () => void;
         dispose();
      }
   });

   return context;
};

export const useRenderer = (): RendererContext => {
   const context = getContext<RendererContext>(CTX_KEY);
   if (!context) {
      throw new Error('useRenderer can only be used in a child component to <Canvas>.');
   }
   return context;
};

export type { RendererContext };
