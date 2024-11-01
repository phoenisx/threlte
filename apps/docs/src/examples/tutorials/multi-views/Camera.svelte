<script lang="ts">
  import { T, useThrelte, type Props } from '@threlte/core'
  import { type PerspectiveCamera } from 'three'
  import type { Snippet } from 'svelte'
  import { useScene } from './scene/exports'

  type AllProps = { children?: Snippet; is: PerspectiveCamera } & Props<PerspectiveCamera>
  let { children, ...props }: AllProps = $props()
  const scene$ = useScene()
  const { invalidate } = useThrelte()
  let camera = $state<PerspectiveCamera>()!

  $effect(() => {
    const size = scene$.bbox
    if (!size) return
    // Update Camera on resize
    handleResize(size.width, size.height)
    invalidate()
  })

  function handleResize(width: number, height: number) {
    if (!camera) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const handleCreate = (camera: PerspectiveCamera) => {
    scene$.camera = camera
  }
</script>

<T
  bind:ref={camera}
  oncreate={handleCreate}
  {...props}
>
  {@render children?.()}
</T>
