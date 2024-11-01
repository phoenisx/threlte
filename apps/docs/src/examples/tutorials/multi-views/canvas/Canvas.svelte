<script lang="ts">
   import { type Snippet } from 'svelte';
   import CanvasContext from './Context.svelte';
   import type { Props as CanvasProps } from './type';

   type Props = { children?: Snippet; wrapper: HTMLElement & HTMLDivElement } & Omit<
      CanvasProps,
      'wrapper' | 'canvas'
   >;
   let { children, wrapper, ...props }: Props = $props();
   let canvas = $state<HTMLCanvasElement>();
</script>

<canvas bind:this={canvas}>
   {#if canvas && wrapper}
      <CanvasContext {canvas} {wrapper} {...props}>
         {@render children?.()}
      </CanvasContext>
   {/if}
</canvas>

<style>
   canvas {
      position: absolute;
   }
</style>
