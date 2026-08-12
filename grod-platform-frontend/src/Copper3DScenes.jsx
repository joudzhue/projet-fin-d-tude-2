import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export function CopperScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const performanceProfile = get3DPerformanceProfile()
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0.15, 1.35, 6.2)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: performanceProfile.antialias,
      powerPreference: performanceProfile.powerPreference,
      preserveDrawingBuffer: true,
    })
    renderer.setPixelRatio(performanceProfile.pixelRatio)
    renderer.shadowMap.enabled = performanceProfile.shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const heroCopper = new THREE.MeshPhysicalMaterial({
      color: 0xb86538,
      metalness: 1,
      roughness: 0.18,
      clearcoat: 0.34,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.35,
    })
    const heroCopperDark = new THREE.MeshPhysicalMaterial({
      color: 0x7b321f,
      metalness: 0.92,
      roughness: 0.28,
      clearcoat: 0.2,
      envMapIntensity: 1.05,
    })
    const heroCopperLight = new THREE.MeshPhysicalMaterial({
      color: 0xf4aa68,
      metalness: 0.96,
      roughness: 0.16,
      clearcoat: 0.38,
      envMapIntensity: 1.45,
    })
    const shadowDark = new THREE.MeshStandardMaterial({ color: 0x2b1510, metalness: 0.4, roughness: 0.55 })
    const fallbackGeometries = []

    function addFallbackMesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
      fallbackGeometries.push(geometry)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...position)
      mesh.rotation.set(...rotation)
      mesh.scale.set(...scale)
      mesh.castShadow = performanceProfile.shadows
      mesh.receiveShadow = performanceProfile.shadows
      group.add(mesh)
      return mesh
    }

    const loader = new GLTFLoader()
    let modelRoot = null
    let fallbackBuilt = false

    function prepareHeroModel(root) {
      modelRoot = root
      modelRoot.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = performanceProfile.shadows
          object.receiveShadow = performanceProfile.shadows
          object.material = object.name?.toLowerCase().includes('cap') ? heroCopperLight : heroCopper
        }
      })

      const bounds = new THREE.Box3().setFromObject(modelRoot)
      const size = bounds.getSize(new THREE.Vector3())
      const center = bounds.getCenter(new THREE.Vector3())
      modelRoot.position.sub(center)
      const maxAxis = Math.max(size.x, size.y, size.z) || 1
      modelRoot.scale.setScalar(3.45 / maxAxis)
      modelRoot.rotation.set(-0.12, -0.46, 0.03)
      group.add(modelRoot)
    }

    function buildFallbackHero() {
      if (fallbackBuilt) return
      fallbackBuilt = true
      buildProductModel('rod', addFallbackMesh, {
        copper: heroCopper,
        copperDark: heroCopperDark,
        copperLight: heroCopperLight,
        shadowDark,
      })
      group.scale.setScalar(1.2)
      group.rotation.set(-0.12, -0.46, 0.03)
    }

    loader.load('/models/copper-rod.glb', (gltf) => prepareHeroModel(gltf.scene), undefined, buildFallbackHero)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.9, 72),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.32 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.28
    floor.position.z = -0.12
    floor.receiveShadow = true
    scene.add(floor)

    const studioGlow = new THREE.Mesh(
      new THREE.RingGeometry(1.05, 2.95, 96),
      new THREE.MeshBasicMaterial({ color: 0xff9f55, transparent: true, opacity: 0.08, side: THREE.DoubleSide }),
    )
    studioGlow.rotation.x = -Math.PI / 2
    studioGlow.position.y = -1.255
    scene.add(studioGlow)

    scene.add(new THREE.HemisphereLight(0xfff4e8, 0x1b0f0a, 1.25))
    const keyLight = new THREE.DirectionalLight(0xffdfbd, 4.2)
    keyLight.position.set(2.8, 4.6, 4.2)
    keyLight.castShadow = performanceProfile.shadows
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)
    const fillLight = new THREE.PointLight(0xff8a3d, 1.9, 7)
    fillLight.position.set(-2.8, 1.2, 2.3)
    scene.add(fillLight)
    const rimLight = new THREE.DirectionalLight(0x7fffd4, 1.05)
    rimLight.position.set(-3.2, 2.1, -2.4)
    scene.add(rimLight)

    function resize() {
      const { width, height } = mount.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    let frameId = 0
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const time = performance.now() * 0.001
      const baseY = -0.46
      group.rotation.y = performanceProfile.reducedMotion ? baseY : baseY + Math.sin(time * 0.34) * 0.16
      group.rotation.x = performanceProfile.reducedMotion ? -0.12 : -0.12 + Math.sin(time * 0.26) * 0.025
      group.position.y = performanceProfile.reducedMotion ? 0 : Math.sin(time * 0.55) * 0.045
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      renderer.dispose()
      floor.geometry.dispose()
      studioGlow.geometry.dispose()
      studioGlow.material.dispose()
      fallbackGeometries.forEach((geometry) => geometry.dispose())
      if (modelRoot) disposeObject3D(modelRoot)
      heroCopper.dispose()
      heroCopperDark.dispose()
      heroCopperLight.dispose()
      shadowDark.dispose()
    }
  }, [])

  return <div className="copper-3d" ref={mountRef} aria-hidden="true" />
}

export function Product3DViewer({ product }) {
  const mountRef = useRef(null)
  const [fullscreen, setFullscreen] = useState(false)
  const labels = getProductLabels(product)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const performanceProfile = get3DPerformanceProfile()
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 1.25, 5.8)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: performanceProfile.antialias,
      powerPreference: performanceProfile.powerPreference,
      preserveDrawingBuffer: true,
    })
    renderer.setPixelRatio(performanceProfile.pixelRatio)
    renderer.shadowMap.enabled = performanceProfile.shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const copper = new THREE.MeshStandardMaterial({ color: 0xc8753d, metalness: 0.88, roughness: 0.24 })
    const copperDark = new THREE.MeshStandardMaterial({ color: 0x8f4026, metalness: 0.78, roughness: 0.3 })
    const copperLight = new THREE.MeshStandardMaterial({ color: 0xffb46e, metalness: 0.82, roughness: 0.2 })
    const shadowDark = new THREE.MeshStandardMaterial({ color: 0x2b1510, metalness: 0.35, roughness: 0.58 })

    function addMesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...position)
      mesh.rotation.set(...rotation)
      mesh.scale.set(...scale)
      mesh.castShadow = performanceProfile.shadows
      mesh.receiveShadow = performanceProfile.shadows
      group.add(mesh)
      return mesh
    }

    const kind = getProduct3DKind(product)
    const loader = new GLTFLoader()
    let modelRoot = null

    loader.load(
      getModelUrl(kind),
      (gltf) => {
        modelRoot = gltf.scene
        modelRoot.traverse((object) => {
          if (object.isMesh) {
            object.castShadow = performanceProfile.shadows
            object.receiveShadow = performanceProfile.shadows
          }
        })
        group.add(modelRoot)
      },
      undefined,
      () => buildProductModel(kind, addMesh, { copper, copperDark, copperLight, shadowDark }),
    )

    group.rotation.x = -0.18
    group.rotation.y = -0.35
    const interaction = {
      dragging: false,
      lastX: 0,
      lastY: 0,
      targetX: -0.18,
      targetY: -0.35,
      targetZoom: 5.8,
    }

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5.8, 4),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.22 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.55
    floor.receiveShadow = performanceProfile.shadows
    scene.add(floor)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x24120c, 1.4))
    const key = new THREE.DirectionalLight(0xffdfb8, 3.2)
    key.position.set(2.5, 4.2, 4.8)
    key.castShadow = performanceProfile.shadows
    scene.add(key)
    const fill = new THREE.PointLight(0xff8a3d, 1.8, 7)
    fill.position.set(-2.5, 1.4, 2.2)
    scene.add(fill)

    function resize() {
      const { width, height } = mount.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    function onPointerDown(event) {
      interaction.dragging = true
      interaction.lastX = event.clientX
      interaction.lastY = event.clientY
      mount.setPointerCapture?.(event.pointerId)
    }

    function onPointerMove(event) {
      if (!interaction.dragging) return
      const deltaX = event.clientX - interaction.lastX
      const deltaY = event.clientY - interaction.lastY
      interaction.lastX = event.clientX
      interaction.lastY = event.clientY
      interaction.targetY += deltaX * 0.008
      interaction.targetX = Math.max(-0.85, Math.min(0.65, interaction.targetX + deltaY * 0.006))
    }

    function onPointerUp(event) {
      interaction.dragging = false
      mount.releasePointerCapture?.(event.pointerId)
    }

    function onWheel(event) {
      event.preventDefault()
      interaction.targetZoom = Math.max(3.7, Math.min(7.4, interaction.targetZoom + event.deltaY * 0.003))
    }

    function onSetView(event) {
      const view = event.detail
      const views = {
        front: { x: -0.18, y: -0.35, zoom: 5.8 },
        side: { x: -0.18, y: Math.PI / 2, zoom: 5.8 },
        top: { x: -1.12, y: -0.25, zoom: 6.4 },
        reset: { x: -0.18, y: -0.35, zoom: 5.8 },
      }
      const nextView = views[view] || views.reset
      interaction.targetX = nextView.x
      interaction.targetY = nextView.y
      interaction.targetZoom = nextView.zoom
    }

    function onCapture() {
      renderer.render(scene, camera)
      const link = document.createElement('a')
      link.href = renderer.domElement.toDataURL('image/png')
      link.download = `${slugify(product?.nom || 'produit-cuivre')}-3d.png`
      link.click()
    }

    mount.addEventListener('pointerdown', onPointerDown)
    mount.addEventListener('pointermove', onPointerMove)
    mount.addEventListener('pointerup', onPointerUp)
    mount.addEventListener('pointerleave', onPointerUp)
    mount.addEventListener('wheel', onWheel, { passive: false })
    mount.addEventListener('product-3d-view', onSetView)
    mount.addEventListener('product-3d-capture', onCapture)

    let frameId = 0
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const time = performance.now() * 0.001
      if (!interaction.dragging && !performanceProfile.reducedMotion) interaction.targetY += 0.002
      group.rotation.x += (interaction.targetX - group.rotation.x) * 0.08
      group.rotation.y += (interaction.targetY - group.rotation.y) * 0.08
      camera.position.z += (interaction.targetZoom - camera.position.z) * 0.08
      group.position.y = performanceProfile.reducedMotion ? 0 : Math.sin(time * 0.9) * 0.05
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      mount.removeEventListener('pointerdown', onPointerDown)
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerup', onPointerUp)
      mount.removeEventListener('pointerleave', onPointerUp)
      mount.removeEventListener('wheel', onWheel)
      mount.removeEventListener('product-3d-view', onSetView)
      mount.removeEventListener('product-3d-capture', onCapture)
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      group.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
      })
      floor.geometry.dispose()
      copper.dispose()
      copperDark.dispose()
      copperLight.dispose()
      shadowDark.dispose()
      renderer.dispose()
    }
  }, [product])

  return (
    <div className="product-3d-viewer">
      <div className="product-3d-canvas" ref={mountRef} />
      <dl className="product-3d-labels">
        {labels.map((label) => (
          <div key={label.term}>
            <dt>{label.term}</dt>
            <dd>{label.value}</dd>
          </div>
        ))}
      </dl>
      <div className="product-3d-controls" aria-label="Controles 3D">
        <button type="button" onClick={() => setProductView(mountRef, 'front')}>Face</button>
        <button type="button" onClick={() => setProductView(mountRef, 'side')}>Cote</button>
        <button type="button" onClick={() => setProductView(mountRef, 'top')}>Dessus</button>
        <button type="button" onClick={() => setProductView(mountRef, 'reset')}>Reset</button>
        <button type="button" onClick={() => captureProductView(mountRef)}>Capture PNG</button>
        <button type="button" onClick={() => setFullscreen(true)}>Plein ecran</button>
      </div>
      <span>Glisser / Zoom</span>
      {fullscreen ? (
        <div className="product-3d-modal" role="dialog" aria-modal="true">
          <div className="product-3d-modal-panel">
            <div className="product-3d-modal-heading">
              <div>
                <p>{product?.categorie || 'Copper products'}</p>
                <h3>{product?.nom || 'Produit cuivre'}</h3>
              </div>
              <button type="button" onClick={() => setFullscreen(false)}>Fermer</button>
            </div>
            <Product3DStage product={product} labels={labels} fullscreen />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Product3DStage({ product, labels, fullscreen = false }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const performanceProfile = get3DPerformanceProfile()
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 1.25, fullscreen ? 5.2 : 5.8)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: performanceProfile.antialias,
      powerPreference: performanceProfile.powerPreference,
      preserveDrawingBuffer: true,
    })
    renderer.setPixelRatio(performanceProfile.pixelRatio)
    renderer.shadowMap.enabled = performanceProfile.shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const copper = new THREE.MeshStandardMaterial({ color: 0xc8753d, metalness: 0.88, roughness: 0.24 })
    const copperDark = new THREE.MeshStandardMaterial({ color: 0x8f4026, metalness: 0.78, roughness: 0.3 })
    const copperLight = new THREE.MeshStandardMaterial({ color: 0xffb46e, metalness: 0.82, roughness: 0.2 })
    const shadowDark = new THREE.MeshStandardMaterial({ color: 0x2b1510, metalness: 0.35, roughness: 0.58 })

    function addMesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...position)
      mesh.rotation.set(...rotation)
      mesh.scale.set(...scale)
      mesh.castShadow = performanceProfile.shadows
      mesh.receiveShadow = performanceProfile.shadows
      group.add(mesh)
      return mesh
    }

    const kind = getProduct3DKind(product)
    const loader = new GLTFLoader()
    loader.load(
      getModelUrl(kind),
      (gltf) => {
        gltf.scene.traverse((object) => {
          if (object.isMesh) {
            object.castShadow = performanceProfile.shadows
            object.receiveShadow = performanceProfile.shadows
          }
        })
        group.add(gltf.scene)
      },
      undefined,
      () => buildProductModel(kind, addMesh, { copper, copperDark, copperLight, shadowDark }),
    )

    group.rotation.x = -0.18
    group.rotation.y = -0.35
    const interaction = {
      dragging: false,
      lastX: 0,
      lastY: 0,
      targetX: -0.18,
      targetY: -0.35,
      targetZoom: fullscreen ? 5.2 : 5.8,
    }

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5.8, 4),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.22 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.55
    floor.receiveShadow = performanceProfile.shadows
    scene.add(floor)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x24120c, 1.4))
    const key = new THREE.DirectionalLight(0xffdfb8, 3.2)
    key.position.set(2.5, 4.2, 4.8)
    key.castShadow = performanceProfile.shadows
    scene.add(key)
    const fill = new THREE.PointLight(0xff8a3d, 1.8, 7)
    fill.position.set(-2.5, 1.4, 2.2)
    scene.add(fill)

    function resize() {
      const { width, height } = mount.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    function onPointerDown(event) {
      interaction.dragging = true
      interaction.lastX = event.clientX
      interaction.lastY = event.clientY
      mount.setPointerCapture?.(event.pointerId)
    }

    function onPointerMove(event) {
      if (!interaction.dragging) return
      const deltaX = event.clientX - interaction.lastX
      const deltaY = event.clientY - interaction.lastY
      interaction.lastX = event.clientX
      interaction.lastY = event.clientY
      interaction.targetY += deltaX * 0.008
      interaction.targetX = Math.max(-0.85, Math.min(0.65, interaction.targetX + deltaY * 0.006))
    }

    function onPointerUp(event) {
      interaction.dragging = false
      mount.releasePointerCapture?.(event.pointerId)
    }

    function onWheel(event) {
      event.preventDefault()
      interaction.targetZoom = Math.max(3.7, Math.min(7.4, interaction.targetZoom + event.deltaY * 0.003))
    }

    function onSetView(event) {
      const view = event.detail
      const views = {
        front: { x: -0.18, y: -0.35, zoom: fullscreen ? 5.2 : 5.8 },
        side: { x: -0.18, y: Math.PI / 2, zoom: fullscreen ? 5.2 : 5.8 },
        top: { x: -1.12, y: -0.25, zoom: fullscreen ? 5.8 : 6.4 },
        reset: { x: -0.18, y: -0.35, zoom: fullscreen ? 5.2 : 5.8 },
      }
      const nextView = views[view] || views.reset
      interaction.targetX = nextView.x
      interaction.targetY = nextView.y
      interaction.targetZoom = nextView.zoom
    }

    mount.addEventListener('pointerdown', onPointerDown)
    mount.addEventListener('pointermove', onPointerMove)
    mount.addEventListener('pointerup', onPointerUp)
    mount.addEventListener('pointerleave', onPointerUp)
    mount.addEventListener('wheel', onWheel, { passive: false })
    mount.addEventListener('product-3d-view', onSetView)

    let frameId = 0
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const time = performance.now() * 0.001
      if (!interaction.dragging && !performanceProfile.reducedMotion) interaction.targetY += 0.002
      group.rotation.x += (interaction.targetX - group.rotation.x) * 0.08
      group.rotation.y += (interaction.targetY - group.rotation.y) * 0.08
      camera.position.z += (interaction.targetZoom - camera.position.z) * 0.08
      group.position.y = performanceProfile.reducedMotion ? 0 : Math.sin(time * 0.9) * 0.05
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      mount.removeEventListener('pointerdown', onPointerDown)
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerup', onPointerUp)
      mount.removeEventListener('pointerleave', onPointerUp)
      mount.removeEventListener('wheel', onWheel)
      mount.removeEventListener('product-3d-view', onSetView)
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      group.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
      })
      floor.geometry.dispose()
      copper.dispose()
      copperDark.dispose()
      copperLight.dispose()
      shadowDark.dispose()
      renderer.dispose()
    }
  }, [product, fullscreen])

  return (
    <>
      <div className="product-3d-canvas" ref={mountRef} />
      <dl className="product-3d-labels">
        {labels.map((label) => (
          <div key={label.term}>
            <dt>{label.term}</dt>
            <dd>{label.value}</dd>
          </div>
        ))}
      </dl>
      <div className="product-3d-controls" aria-label="Controles 3D">
        <button type="button" onClick={() => setProductView(mountRef, 'front')}>Face</button>
        <button type="button" onClick={() => setProductView(mountRef, 'side')}>Cote</button>
        <button type="button" onClick={() => setProductView(mountRef, 'top')}>Dessus</button>
        <button type="button" onClick={() => setProductView(mountRef, 'reset')}>Reset</button>
        <button type="button" onClick={() => captureProductView(mountRef)}>Capture PNG</button>
      </div>
      <span>Glisser / Zoom</span>
    </>
  )
}

function setProductView(mountRef, view) {
  mountRef.current?.dispatchEvent(new CustomEvent('product-3d-view', { detail: view }))
}

function captureProductView(mountRef) {
  mountRef.current?.dispatchEvent(new CustomEvent('product-3d-capture'))
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function disposeObject3D(object3D) {
  object3D.traverse((object) => {
    if (!object.isMesh) return
    object.geometry?.dispose?.()
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.filter(Boolean).forEach((material) => material.dispose?.())
  })
}

function getProductLabels(product) {
  const kind = getProduct3DKind(product)
  const formByKind = {
    rod: 'Barre ronde',
    anodes: 'Anode cuivre',
    'bus-bars': 'Barre conductrice',
    tubes: 'Tube cuivre',
    sheets: 'Feuille / plaque',
    wire: 'Fil cuivre',
    custom: 'Piece sur mesure',
  }

  return [
    { term: 'Forme', value: formByKind[kind] || formByKind.rod },
    { term: 'Purete', value: product?.purete || (kind === 'anodes' ? '50% a 99,99%' : 'Cuivre conducteur') },
    { term: 'Norme', value: product?.normes || 'Selon specification' },
    { term: 'Dimensions', value: product?.dimensions || 'Selon demande' },
  ].filter((label) => label.value)
}

function buildProductModel(kind, addMesh, materials) {
  const { copper, copperDark, copperLight, shadowDark } = materials

  if (kind === 'rod') {
    const rod = new THREE.CylinderGeometry(0.18, 0.18, 3.5, 48)
    for (let row = 0; row < 3; row += 1) {
      for (let index = 0; index < 5 - row; index += 1) {
        addMesh(rod, copper, [index * 0.38 - 0.78 + row * 0.19, row * 0.34 - 0.38, 0], [0, 0, Math.PI / 2])
      }
    }
    return
  }

  if (kind === 'anodes') {
    const anode = new THREE.BoxGeometry(0.34, 1.8, 0.18)
    const handle = new THREE.BoxGeometry(0.16, 0.36, 0.16)
    for (let index = 0; index < 8; index += 1) {
      const x = index * 0.38 - 1.32
      addMesh(anode, index % 2 ? copperDark : copper, [x, -0.1, 0], [0, 0.18, 0])
      addMesh(handle, copperLight, [x, 0.98, 0], [0, 0.18, 0])
    }
    return
  }

  if (kind === 'bus-bars') {
    const bar = new THREE.BoxGeometry(3.4, 0.2, 0.38)
    const hole = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 32)
    for (let index = 0; index < 4; index += 1) {
      addMesh(bar, index % 2 ? copperDark : copper, [0, index * 0.27 - 0.4, index * -0.13], [0, -0.32, 0])
      for (let h = 0; h < 4; h += 1) {
        addMesh(hole, shadowDark, [h * 0.72 - 1.08, index * 0.27 - 0.28, index * -0.13 + 0.2], [Math.PI / 2, 0, 0])
      }
    }
    return
  }

  if (kind === 'tubes') {
    const tube = new THREE.CylinderGeometry(0.2, 0.2, 3.2, 48, 1, true)
    const opening = new THREE.TorusGeometry(0.2, 0.035, 16, 48)
    for (let index = 0; index < 5; index += 1) {
      const y = index * 0.28 - 0.55
      addMesh(tube, copper, [index * 0.24 - 0.48, y, 0], [0, 0, Math.PI / 2])
      addMesh(opening, copperLight, [1.6 + index * 0.24 - 0.48, y, 0], [0, Math.PI / 2, 0])
    }
    return
  }

  if (kind === 'sheets') {
    const sheet = new THREE.BoxGeometry(3.2, 0.08, 1.7)
    for (let index = 0; index < 6; index += 1) {
      addMesh(sheet, index % 2 ? copperDark : copper, [0, index * 0.09 - 0.28, -index * 0.08], [-0.1, -0.28, 0])
    }
    return
  }

  if (kind === 'wire') {
    const coil = new THREE.TorusGeometry(0.78, 0.065, 20, 80)
    const wire = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 32)
    for (let index = 0; index < 5; index += 1) {
      addMesh(coil, copper, [index * 0.08 - 0.16, index * 0.04 - 0.18, 0], [Math.PI / 2.7, 0, 0.18])
    }
    addMesh(wire, copperLight, [1.1, -0.4, 0.15], [0.2, 0.15, Math.PI / 2])
    addMesh(wire, copper, [1.35, -0.58, -0.05], [0.1, -0.08, Math.PI / 2])
    return
  }

  const base = new THREE.BoxGeometry(0.95, 0.32, 0.62)
  const bracket = new THREE.BoxGeometry(0.34, 0.95, 0.32)
  const cylinder = new THREE.CylinderGeometry(0.25, 0.25, 0.52, 40)
  addMesh(base, copper, [-0.9, -0.35, 0], [0, -0.32, 0])
  addMesh(base, copperDark, [0.25, -0.35, -0.25], [0, -0.32, 0])
  addMesh(bracket, copper, [0.95, 0.04, -0.05], [0, -0.32, 0])
  addMesh(cylinder, copperLight, [0.18, 0.2, 0.45], [Math.PI / 2, 0, 0])
  addMesh(cylinder, copperDark, [-0.55, 0.18, 0.5], [Math.PI / 2, 0, 0])
}

function getModelUrl(kind) {
  const files = {
    rod: 'copper-rod.glb',
    anodes: 'copper-anodes.glb',
    'bus-bars': 'copper-bus-bars.glb',
    tubes: 'copper-tubes.glb',
    sheets: 'copper-sheets.glb',
    wire: 'copper-wire.glb',
    custom: 'custom-copper-parts.glb',
  }

  return `/models/${files[kind] || files.rod}`
}

function get3DPerformanceProfile() {
  const deviceMemory = navigator.deviceMemory || 8
  const hardwareConcurrency = navigator.hardwareConcurrency || 8
  const saveData = Boolean(navigator.connection?.saveData)
  const mobileViewport = window.matchMedia?.('(max-width: 760px)').matches
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const lowPowerDevice = saveData || mobileViewport || deviceMemory <= 4 || hardwareConcurrency <= 4
  const maxPixelRatio = lowPowerDevice ? 1.15 : 1.75

  return {
    antialias: !lowPowerDevice,
    pixelRatio: Math.min(window.devicePixelRatio || 1, maxPixelRatio),
    powerPreference: lowPowerDevice ? 'low-power' : 'high-performance',
    shadows: !lowPowerDevice,
    reducedMotion,
  }
}

function getProduct3DKind(product) {
  const name = String(product?.nom || '').toLowerCase()
  if (name.includes('anode')) return 'anodes'
  if (name.includes('bus')) return 'bus-bars'
  if (name.includes('tube')) return 'tubes'
  if (name.includes('sheet') || name.includes('flat') || name.includes('meplat') || name.includes('méplat')) return 'sheets'
  if (name.includes('wire') || name.includes('fil')) return 'wire'
  if (name.includes('custom') || name.includes('part') || name.includes('piece') || name.includes('pièce')) return 'custom'
  return 'rod'
}
