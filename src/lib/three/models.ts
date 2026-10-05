import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ProjectModel } from '@/data/portfolio'

// Paleta pastel iridiscente (la misma del fondo anterior) y tintes por proyecto.
export const PALETTE: [string, string][] = [
  ['#a8ecc9', '#bfe6f2'],
  ['#f7c0c4', '#ffd9ac'],
  ['#cabdf2', '#bcd0f6'],
  ['#bfeede', '#a9d8f5'],
  ['#f3eca6', '#f6c5c9'],
]
export const PROJECT_THEMES: [string, string][] = [
  ['#a8ecc9', '#7fd3c4'],
  ['#f7c0c4', '#ffb27a'],
  ['#cabdf2', '#9fb6f6'],
  ['#bfeede', '#79c4f5'],
]
const INK = '#3a3c58'

// Material base: perlado iridiscente, como los blobs glossy del portafolio.
export function makeMaterial(color: THREE.ColorRepresentation, o: THREE.MeshPhysicalMaterialParameters = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.3,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    iridescence: 0.9,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [120, 460],
    ...o,
  })
}
const mat = makeMaterial

export type ModelDef = {
  group: THREE.Group
  rot: [number, number] // inclinación base (x, y)
  update: (t: number) => void
}

const rbox = (
  w: number,
  h: number,
  d: number,
  color: THREE.ColorRepresentation,
  o: THREE.MeshPhysicalMaterialParameters = {},
  seg = 4,
  r = 0.08,
) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, r), mat(color, o))

function buildTruck(): ModelDef {
  const g = new THREE.Group()
  const trailer = rbox(2.3, 1.25, 1.1, '#a8ecc9')
  trailer.position.set(-0.55, 0.3, 0)
  const stripe = rbox(2.34, 0.16, 1.14, '#7fd3c4', {}, 2, 0.05)
  stripe.position.set(-0.55, 0.05, 0)
  const logo = rbox(0.5, 0.5, 1.16, '#f3eca6', {}, 3, 0.12)
  logo.position.set(-0.55, 0.55, 0)

  // Cabina: perfil lateral extruido con hueco de ventana.
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.lineTo(0.95, 0)
  s.lineTo(0.95, 0.5)
  s.lineTo(0.62, 1.05)
  s.lineTo(0, 1.05)
  s.closePath()
  const win = new THREE.Path()
  win.moveTo(0.16, 0.6)
  win.lineTo(0.76, 0.6)
  win.lineTo(0.58, 0.88)
  win.lineTo(0.16, 0.88)
  win.closePath()
  s.holes.push(win)
  const cabGeo = new THREE.ExtrudeGeometry(s, {
    depth: 0.96,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 3,
    curveSegments: 8,
  })
  cabGeo.translate(0, 0, -0.48)
  const cab = new THREE.Mesh(cabGeo, mat('#f7c0c4'))
  cab.position.set(0.7, -0.325, 0)
  const glassGeo = new THREE.ExtrudeGeometry(new THREE.Shape(win.getPoints()), { depth: 0.9, bevelEnabled: false })
  glassGeo.translate(0, 0, -0.45)
  const glass = new THREE.Mesh(glassGeo, mat(INK, { roughness: 0.06, metalness: 0.3, iridescence: 0.6 }))
  glass.position.copy(cab.position)

  const bumper = rbox(0.14, 0.26, 1.0, INK, { iridescence: 0.2 }, 2, 0.05)
  bumper.position.set(1.72, -0.24, 0)
  const lightGeo = new THREE.SphereGeometry(0.09, 20, 14)
  const lightMat = mat('#fff3b0', { emissive: '#ffe58a', emissiveIntensity: 0.6 })
  const l1 = new THREE.Mesh(lightGeo, lightMat)
  l1.position.set(1.68, -0.02, 0.33)
  const l2 = l1.clone()
  l2.position.z = -0.33
  const chassis = rbox(3.3, 0.16, 0.86, INK, { iridescence: 0.2 }, 2, 0.05)
  chassis.position.set(0.05, -0.42, 0)
  g.add(trailer, stripe, logo, cab, glass, bumper, l1, l2, chassis)

  const tire = new THREE.CylinderGeometry(0.3, 0.3, 0.24, 36)
  const hub = new THREE.CylinderGeometry(0.13, 0.13, 0.26, 24)
  const tireMat = mat(INK, { roughness: 0.55, iridescence: 0.1, clearcoat: 0.3 })
  const hubMat = mat('#e2e1dc', { metalness: 0.6, roughness: 0.25 })
  const wheels: THREE.Group[] = []
  for (const x of [-1.25, -0.55, 1.25]) {
    for (const z of [0.5, -0.5]) {
      const w = new THREE.Group()
      w.add(new THREE.Mesh(tire, tireMat), new THREE.Mesh(hub, hubMat))
      w.rotation.x = Math.PI / 2
      w.position.set(x, -0.5, z)
      g.add(w)
      wheels.push(w)
    }
  }
  return {
    group: g,
    rot: [0.2, -0.55],
    update: (t) => wheels.forEach((w) => (w.rotation.y = -t * 2.2)),
  }
}

function buildBall(): ModelDef {
  const g = new THREE.Group()
  // Balón: esfera con 12 parches oscuros en los vértices de un icosaedro.
  const geo = new THREE.SphereGeometry(1, 160, 120)
  const ico = new THREE.IcosahedronGeometry(1, 0).getAttribute('position')
  const centers: THREE.Vector3[] = []
  for (let i = 0; i < ico.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(ico, i).normalize()
    if (!centers.some((c) => c.distanceTo(v) < 1e-3)) centers.push(v)
  }
  const pos = geo.getAttribute('position')
  const cols: number[] = []
  const white = new THREE.Color('#f7f6f2')
  const dark = new THREE.Color(INK)
  const tmp = new THREE.Color()
  const v = new THREE.Vector3()
  const lo = Math.cos(0.36)
  const hi = Math.cos(0.32)
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize()
    let best = -1
    for (const c of centers) best = Math.max(best, c.dot(v))
    tmp.copy(white).lerp(dark, THREE.MathUtils.smoothstep(best, lo, hi))
    cols.push(tmp.r, tmp.g, tmp.b)
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
  const ball = new THREE.Mesh(geo, mat('#ffffff', { vertexColors: true, roughness: 0.35, iridescence: 0.5 }))
  g.add(ball)

  // Estela de gotas: el balón sale del líquido.
  const trail: [number, number, number][] = [
    [-1.35, -0.45, 0.3],
    [-1.9, -0.78, 0.19],
    [-2.3, -1.0, 0.12],
  ]
  trail.forEach(([x, y, r], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), mat(PROJECT_THEMES[1][i % 2]))
    m.position.set(x, y, 0)
    g.add(m)
  })
  const pitch = rbox(2.2, 0.06, 0.9, '#a8ecc9', { iridescence: 0.4 }, 2, 0.03)
  pitch.position.set(0.1, -1.18, 0)
  g.add(pitch)
  return {
    group: g,
    rot: [0.12, 0.2],
    update: (t) => {
      ball.rotation.z = -t * 1.1
      ball.rotation.y = t * 0.4
    },
  }
}

function buildRings(): ModelDef {
  const g = new THREE.Group()
  const torus = new THREE.TorusGeometry(0.85, 0.15, 48, 140)
  // Entrelazados: cada anillo gira sobre el eje X, que pasa por el hueco del otro.
  const ringA = new THREE.Group()
  ringA.add(new THREE.Mesh(torus, mat('#f3d9a0', { metalness: 0.85, roughness: 0.18, iridescence: 0.35 })))
  const prong = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.2, 6), mat('#f3d9a0', { metalness: 0.85, roughness: 0.2 }))
  prong.position.set(0, 1.04, 0)
  prong.rotation.x = Math.PI
  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.24, 0),
    mat('#ffffff', { metalness: 0, roughness: 0, transmission: 1, thickness: 0.5, ior: 2.4, iridescence: 1 }),
  )
  diamond.scale.set(1, 1.3, 1)
  diamond.position.set(0, 1.27, 0)
  ringA.add(prong, diamond)
  ringA.position.set(-0.45, 0, 0)
  ringA.rotation.x = -0.35
  const ringB = new THREE.Mesh(torus, mat('#f2b8a8', { metalness: 0.85, roughness: 0.2, iridescence: 0.35 }))
  ringB.position.set(0.45, 0, 0)
  ringB.rotation.x = 1.0
  g.add(ringA, ringB)
  return { group: g, rot: [0.15, 0.35], update: (t) => (diamond.rotation.y = t * 0.8) }
}

function buildChart(): ModelDef {
  const g = new THREE.Group()
  const base = rbox(2.7, 0.12, 1.1, '#e2e1dc', {}, 3, 0.05)
  base.position.set(0, -1.06, 0)
  g.add(base)
  const heights = [0.7, 1.1, 0.85, 1.65]
  const xs = [-0.95, -0.32, 0.32, 0.95]
  const colors = ['#cabdf2', '#9fb6f6', '#f7c0c4', '#a8ecc9']
  const bars = xs.map((x, i) => {
    const b = rbox(0.44, heights[i], 0.44, colors[i], {}, 4, 0.07)
    b.position.set(x, -1 + heights[i] / 2, 0)
    g.add(b)
    return b
  })
  const pts = xs.map((x, i) => new THREE.Vector3(x, -1 + heights[i] + 0.3, 0.3))
  pts.push(new THREE.Vector3(1.4, -1 + 1.65 + 0.75, 0.3))
  const curve = new THREE.CatmullRomCurve3(pts)
  const lineMat = mat(INK, { roughness: 0.25, iridescence: 0.3 })
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.05, 12, false), lineMat))
  const dotGeo = new THREE.SphereGeometry(0.09, 20, 14)
  const dotMat = mat('#ffffff')
  pts.slice(0, 4).forEach((p) => {
    const d = new THREE.Mesh(dotGeo, dotMat)
    d.position.copy(p)
    g.add(d)
  })
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.32, 28), lineMat)
  arrow.position.copy(pts[pts.length - 1])
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangentAt(1))
  g.add(arrow)

  // Moneda que gira: el lado cripto del tablero.
  const coin = new THREE.Group()
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.07, 48),
    mat('#f3d9a0', { metalness: 0.9, roughness: 0.2, iridescence: 0.3 }),
  )
  disc.rotation.x = Math.PI / 2
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 12, 48), mat('#e8c77a', { metalness: 0.9, roughness: 0.25 }))
  rim.position.z = 0.04
  coin.add(disc, rim)
  coin.position.set(-0.95, 0.75, 0.2)
  g.add(coin)
  return {
    group: g,
    rot: [0.18, -0.35],
    update: (t) => {
      coin.rotation.y = t * 1.6
      bars.forEach((b, i) => (b.scale.y = 1 + Math.sin(t * 1.4 + i) * 0.03))
    },
  }
}

function buildMic(): ModelDef {
  const g = new THREE.Group()
  // Micrófono de estudio: cápsula con rejilla, cuerpo, horquilla y base.
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), mat('#cabdf2', { roughness: 0.25 }))
  head.scale.set(1, 1.25, 1)
  head.position.y = 0.75
  const grilleMat = mat(INK, { roughness: 0.3, iridescence: 0.2 })
  for (const [y, r] of [
    [0.45, 0.42],
    [0.75, 0.51],
    [1.05, 0.42],
  ]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 10, 64), grilleMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = y
    g.add(ring)
  }
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.75, 40), mat('#9fb6f6'))
  body.position.y = -0.05
  // Horquilla en U que sostiene la cápsula.
  const yoke = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 12, 48, Math.PI), mat('#e2e1dc', { metalness: 0.6, roughness: 0.25 }))
  yoke.rotation.z = Math.PI
  yoke.position.y = 0.55
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.75, 16), mat('#e2e1dc', { metalness: 0.6, roughness: 0.25 }))
  stem.position.y = -0.45
  const base = rbox(1.1, 0.14, 0.7, INK, { iridescence: 0.2 }, 3, 0.06)
  base.position.y = -0.86
  g.add(head, body, yoke, stem, base)

  // Ondas de voz que salen hacia un lado y laten.
  const waves = [0.85, 1.12, 1.39].map((r, i) => {
    const w = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 12, 48, Math.PI / 2), mat(PROJECT_THEMES[i % 4][1]))
    w.rotation.z = -Math.PI / 4
    w.position.set(0.1, 0.75, 0)
    g.add(w)
    return w
  })
  return {
    group: g,
    rot: [0.1, -0.35],
    update: (t) =>
      waves.forEach((w, i) => {
        const k = 1 + 0.06 * Math.sin(t * 3 - i * 0.9)
        w.scale.set(k, k, 1)
      }),
  }
}

function buildLeaf(): ModelDef {
  const g = new THREE.Group()
  // Hoja de café: silueta extruida, nervio central y manchas de roya.
  const s = new THREE.Shape()
  s.moveTo(0, -1.2)
  s.bezierCurveTo(0.95, -0.6, 0.9, 0.6, 0, 1.2)
  s.bezierCurveTo(-0.9, 0.6, -0.95, -0.6, 0, -1.2)
  const leafGeo = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 32 })
  leafGeo.translate(0, 0, -0.03)
  const leaf = new THREE.Group()
  leaf.add(new THREE.Mesh(leafGeo, mat('#a8ecc9', { roughness: 0.35 })))
  const rib = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.15, 0.08),
    new THREE.Vector3(0.05, 0, 0.1),
    new THREE.Vector3(0, 1.1, 0.08),
  ])
  leaf.add(new THREE.Mesh(new THREE.TubeGeometry(rib, 48, 0.025, 8, false), mat('#7fd3c4')))
  const spotMat = mat('#c98b5a', { roughness: 0.6, iridescence: 0.1 })
  for (const [x, y, r] of [
    [0.32, 0.25, 0.13],
    [-0.28, -0.3, 0.11],
    [0.18, -0.6, 0.09],
  ]) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), spotMat)
    spot.scale.z = 0.3
    spot.position.set(x, y, 0.09)
    leaf.add(spot)
  }
  leaf.rotation.z = -0.45
  g.add(leaf)

  // Cerezas de café junto a la hoja.
  const cherryMat = mat('#f2959b')
  for (const [x, y] of [
    [-0.95, 0.75],
    [-0.72, 0.98],
  ]) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 20), cherryMat)
    c.position.set(x, y, 0.15)
    g.add(c)
  }

  // Lupa que "escanea" una mancha: el diagnóstico.
  const lens = new THREE.Group()
  const ringGeo = new THREE.TorusGeometry(0.4, 0.06, 16, 64)
  lens.add(new THREE.Mesh(ringGeo, mat(INK, { roughness: 0.25, iridescence: 0.3 })))
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.39, 0.39, 0.02, 48),
    mat('#ffffff', { roughness: 0, metalness: 0, transmission: 1, thickness: 0.2, iridescence: 1 }),
  )
  glass.rotation.x = Math.PI / 2
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.7, 20), mat(INK, { roughness: 0.3 }))
  handle.position.set(0.52, -0.52, 0)
  handle.rotation.z = Math.PI / 4
  lens.add(glass, handle)
  lens.position.set(0.55, 0.45, 0.45)
  g.add(lens)
  return {
    group: g,
    rot: [0.2, 0.3],
    update: (t) => {
      lens.position.x = 0.55 + Math.sin(t * 0.8) * 0.12
      lens.position.y = 0.45 + Math.cos(t * 0.8) * 0.08
    },
  }
}

const builders: Record<ProjectModel, () => ModelDef> = {
  mic: buildMic,
  leaf: buildLeaf,
  truck: buildTruck,
  ball: buildBall,
  rings: buildRings,
  chart: buildChart,
}

export function buildProjectModel(kind: ProjectModel): ModelDef {
  return builders[kind]()
}
