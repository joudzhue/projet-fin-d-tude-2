import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

if (!globalThis.FileReader) {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer
        this.onloadend?.()
      })
    }
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../public/models')

const copper = new THREE.MeshStandardMaterial({ color: 0xc8753d, metalness: 0.88, roughness: 0.24 })
const copperDark = new THREE.MeshStandardMaterial({ color: 0x8f4026, metalness: 0.78, roughness: 0.3 })
const copperLight = new THREE.MeshStandardMaterial({ color: 0xffb46e, metalness: 0.82, roughness: 0.2 })
const shadowDark = new THREE.MeshStandardMaterial({ color: 0x2b1510, metalness: 0.35, roughness: 0.58 })

function addMesh(group, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
}

function buildRod() {
  const group = new THREE.Group()
  const rod = new THREE.CylinderGeometry(0.18, 0.18, 3.5, 48)
  for (let row = 0; row < 3; row += 1) {
    for (let index = 0; index < 5 - row; index += 1) {
      addMesh(group, rod, copper, [index * 0.38 - 0.78 + row * 0.19, row * 0.34 - 0.38, 0], [0, 0, Math.PI / 2])
    }
  }
  return group
}

function buildAnodes() {
  const group = new THREE.Group()
  const anode = new THREE.BoxGeometry(0.34, 1.8, 0.18)
  const handle = new THREE.BoxGeometry(0.16, 0.36, 0.16)
  for (let index = 0; index < 8; index += 1) {
    const x = index * 0.38 - 1.32
    addMesh(group, anode, index % 2 ? copperDark : copper, [x, -0.1, 0], [0, 0.18, 0])
    addMesh(group, handle, copperLight, [x, 0.98, 0], [0, 0.18, 0])
  }
  return group
}

function buildBusBars() {
  const group = new THREE.Group()
  const bar = new THREE.BoxGeometry(3.4, 0.2, 0.38)
  const hole = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 32)
  for (let index = 0; index < 4; index += 1) {
    addMesh(group, bar, index % 2 ? copperDark : copper, [0, index * 0.27 - 0.4, index * -0.13], [0, -0.32, 0])
    for (let h = 0; h < 4; h += 1) {
      addMesh(group, hole, shadowDark, [h * 0.72 - 1.08, index * 0.27 - 0.28, index * -0.13 + 0.2], [Math.PI / 2, 0, 0])
    }
  }
  return group
}

function buildTubes() {
  const group = new THREE.Group()
  const tube = new THREE.CylinderGeometry(0.2, 0.2, 3.2, 48, 1, true)
  const opening = new THREE.TorusGeometry(0.2, 0.035, 16, 48)
  for (let index = 0; index < 5; index += 1) {
    const y = index * 0.28 - 0.55
    addMesh(group, tube, copper, [index * 0.24 - 0.48, y, 0], [0, 0, Math.PI / 2])
    addMesh(group, opening, copperLight, [1.6 + index * 0.24 - 0.48, y, 0], [0, Math.PI / 2, 0])
  }
  return group
}

function buildSheets() {
  const group = new THREE.Group()
  const sheet = new THREE.BoxGeometry(3.2, 0.08, 1.7)
  for (let index = 0; index < 6; index += 1) {
    addMesh(group, sheet, index % 2 ? copperDark : copper, [0, index * 0.09 - 0.28, -index * 0.08], [-0.1, -0.28, 0])
  }
  return group
}

function buildWire() {
  const group = new THREE.Group()
  const coil = new THREE.TorusGeometry(0.78, 0.065, 20, 80)
  const wire = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 32)
  for (let index = 0; index < 5; index += 1) {
    addMesh(group, coil, copper, [index * 0.08 - 0.16, index * 0.04 - 0.18, 0], [Math.PI / 2.7, 0, 0.18])
  }
  addMesh(group, wire, copperLight, [1.1, -0.4, 0.15], [0.2, 0.15, Math.PI / 2])
  addMesh(group, wire, copper, [1.35, -0.58, -0.05], [0.1, -0.08, Math.PI / 2])
  return group
}

function buildCustomParts() {
  const group = new THREE.Group()
  const base = new THREE.BoxGeometry(0.95, 0.32, 0.62)
  const bracket = new THREE.BoxGeometry(0.34, 0.95, 0.32)
  const cylinder = new THREE.CylinderGeometry(0.25, 0.25, 0.52, 40)
  addMesh(group, base, copper, [-0.9, -0.35, 0], [0, -0.32, 0])
  addMesh(group, base, copperDark, [0.25, -0.35, -0.25], [0, -0.32, 0])
  addMesh(group, bracket, copper, [0.95, 0.04, -0.05], [0, -0.32, 0])
  addMesh(group, cylinder, copperLight, [0.18, 0.2, 0.45], [Math.PI / 2, 0, 0])
  addMesh(group, cylinder, copperDark, [-0.55, 0.18, 0.5], [Math.PI / 2, 0, 0])
  return group
}

const models = [
  ['copper-rod.glb', buildRod],
  ['copper-anodes.glb', buildAnodes],
  ['copper-bus-bars.glb', buildBusBars],
  ['copper-tubes.glb', buildTubes],
  ['copper-sheets.glb', buildSheets],
  ['copper-wire.glb', buildWire],
  ['custom-copper-parts.glb', buildCustomParts],
]

async function exportModel(filename, build) {
  const exporter = new GLTFExporter()
  const group = build()
  group.name = filename.replace('.glb', '')
  const arrayBuffer = await exporter.parseAsync(group, { binary: true })
  await writeFile(path.join(outputDir, filename), Buffer.from(arrayBuffer))
}

await mkdir(outputDir, { recursive: true })
for (const [filename, build] of models) {
  await exportModel(filename, build)
}

console.log(`Generated ${models.length} GLB models in ${outputDir}`)
