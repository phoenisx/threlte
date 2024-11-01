<script lang="ts">
  import {
    createCacheContext,
    createCameraContext,
    createCanvasContext,
    createDisposalContext,
    createSchedulerContext,
    useTask,
  } from '@threlte/core';
  import { createRendererContext, isWebGLRenderer } from './renderer.context.svelte.ts';
  import { createScenesContext } from './scenes.context.svelte.ts';
   import type { Props } from './type';
  import { createUserContext } from './user.context.ts'


  let { children, ...options }: Props = $props();

  createCanvasContext(options);
  createCacheContext();
  createDisposalContext();
  createSchedulerContext(options);
  createScenesContext();
  createCameraContext();
  const { renderer, autoRenderTask } = createRendererContext(options);
  createUserContext();


  useTask(
    () => {
      if (isWebGLRenderer(renderer)) {
        renderer.setClearColor(0xffffff);
        renderer.setScissorTest(false);
        renderer.clear();
        renderer.setClearColor(0xe0e0e0);
        renderer.setScissorTest(true);
      }
    },
    {
      before: autoRenderTask,
      autoStart: true,
      autoInvalidate: true
    }
  )
</script>

{@render children?.()}
