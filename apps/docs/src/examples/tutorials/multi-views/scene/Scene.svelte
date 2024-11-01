<script lang="ts">
   import { type Snippet } from 'svelte';
   import { createParentContext, createRootParentObject3DContext } from '@threlte/core';
   import { createSceneContext } from './scene.context.svelte.ts';

   type Props = {
      container: HTMLElement;
      children?: Snippet;
   };
   let { children, container }: Props = $props();

   const sceneCtx = createSceneContext(container);
   createParentContext(sceneCtx.scene);
   createRootParentObject3DContext(sceneCtx.scene);
</script>

{@render children?.()}
