<script lang="ts">
  import { BoxGeometry, SphereGeometry, DodecahedronGeometry, CylinderGeometry } from 'three'
  import { Canvas } from './canvas/exports'
  import { Scene } from './scene/exports'
  import View from "./View.svelte";

  let wrapper = $state<HTMLDivElement>()
  const geometries = [
    new BoxGeometry(1, 1, 1),
    new SphereGeometry(0.5, 12, 8),
    new DodecahedronGeometry(0.5),
    new CylinderGeometry(0.5, 0.5, 1, 12)
  ]
  const elements = $state<HTMLDivElement[]>(new Array(9).fill(null))

  const getGeometry = () =>
    geometries[(geometries.length * Math.random()) | 0]!
</script>

<div
  class="wrapper"
  bind:this={wrapper}
>
  <Canvas
    {wrapper}
    autoRender
  >
    {#each elements as ele, i (i)}
      {#if ele}
        <Scene container={ele}>
          <View geometry={getGeometry()} />
        </Scene>
      {/if}
    {/each}
  </Canvas>

  <div class="content">
    <p>Threlte - Multiple Elements - WebGL</p>
    <ul>
      {#each elements as _, i (i)}
        <li>
          <div bind:this={elements[i]}></div>
          <span>Scene {i + 1}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .wrapper {
    width: 100%;
    min-height: 100vh;
    height: 100%;
  }

  .content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;;
    align-items: center;
    height: 100%;
  }

  ul {
    margin: 1rem;
    display: grid;
    grid-gap: 0.75rem;
    grid-template-columns: 1fr 1fr 1fr;
    max-width: 100%;
  }

  li {
    display: inline-block;
    padding: 0.5rem;
    box-shadow: 1px 2px 4px 0px rgba(0, 0, 0, 0.25);
  }

  li > div {
    width: 200px;
    height: 200px;
  }

  li > span {
    color: #888;
    font-family: sans-serif;
    font-size: large;
    width: 200px;
    margin-top: 0.5em;
  }
</style>
