<script lang="ts">
  import { type BufferGeometry, Color, SRGBColorSpace, PerspectiveCamera } from 'three'
  import { T } from '@threlte/core'
  import { OrbitControls } from '@threlte/extras'
  import Camera from './Camera.svelte'

  let { geometry }: { geometry: BufferGeometry } = $props()
</script>

<Camera
  makeDefault
  is={new PerspectiveCamera(50, 1, 1, 10)}
  position.z={2}
>
  <OrbitControls
    enablePan={false}
    enableZoom={false}
    minDistance={2}
    maxDistance={5}
  />
</Camera>

<T.HemisphereLight args={[0xaaaaaa, 0x444444, 3]} />
<T.DirectionalLight
  args={[0xffffff, 1.5]}
  position={[1, 1, 1]}
/>

<T.Mesh>
  <T is={geometry} />
  <T.MeshStandardMaterial
    color={new Color().setHSL(Math.random(), 1, 0.75, SRGBColorSpace)}
    roughness={0.5}
    metalness={0}
    flatShading={true}
  />
</T.Mesh>
