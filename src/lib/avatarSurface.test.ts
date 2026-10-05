import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { buildSupershapeData, paramsFor } from './supershape'

// Replica la lógica de buildFace en src/lib/three/scene.ts (surface/front y el rayo de la cima).
function buildProbe(name: string) {
  const P = paramsFor(name)
  const data = buildSupershapeData(P)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
  geo.setIndex(new THREE.BufferAttribute(data.indices, 1))
  geo.computeVertexNormals()
  const probe = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
  probe.updateMatrixWorld(true)
  return { P, probe }
}

const rc = new THREE.Raycaster()
function cast(probe: THREE.Mesh, from: THREE.Vector3, dir: THREE.Vector3) {
  rc.set(from, dir)
  return rc.intersectObject(probe, false)[0] ?? null
}
const front = (probe: THREE.Mesh, x: number, y: number) =>
  cast(probe, new THREE.Vector3(x, y, 5), new THREE.Vector3(0, 0, -1))

const GENERATED = Array.from({ length: 200 }, (_, i) => `avatar-${i}-${(i * 104729).toString(36)}`)
const NAMES = ['Visitante', 'Ana', 'Daniel', ...GENERATED]

describe('superficie del avatar (rayos de buildFace)', () => {
  it('el rayo de la cima con origen desplazado siempre impacta', () => {
    const misses: string[] = []
    for (const n of NAMES) {
      const { probe } = buildProbe(n)
      const hit = cast(probe, new THREE.Vector3(0.001, 5, 0.0013), new THREE.Vector3(0, -1, 0))
      if (!hit) misses.push(n)
      else {
        expect(Number.isFinite(hit.point.y)).toBe(true)
        // La cima está en la parte alta del cuerpo normalizado ([-1,1]).
        expect(hit.point.y).toBeGreaterThan(0)
        expect(hit.point.y).toBeLessThanOrEqual(1 + 1e-4)
      }
    }
    expect(misses).toEqual([])
  })

  it('los ojos (±eyeGap, eyeY) impactan, directos o con el fallback del código', () => {
    const misses: string[] = []
    for (const n of NAMES) {
      const { P, probe } = buildProbe(n)
      const { eyeGap, eyeY } = P.face
      for (const side of [-1, 1]) {
        const hit = front(probe, side * eyeGap, eyeY) ?? front(probe, side * eyeGap * 0.6, eyeY * 0.5)
        if (!hit) misses.push(`${n} lado ${side}`)
      }
    }
    expect(misses).toEqual([])
  })

  it('el primer impacto frontal de cada ojo tiene z > 0', () => {
    const bad: string[] = []
    for (const n of NAMES) {
      const { P, probe } = buildProbe(n)
      const { eyeGap, eyeY } = P.face
      for (const side of [-1, 1]) {
        const hit = front(probe, side * eyeGap, eyeY) ?? front(probe, side * eyeGap * 0.6, eyeY * 0.5)
        if (hit && !(hit.point.z > 0)) bad.push(`${n} lado ${side} z=${hit.point.z}`)
      }
    }
    expect(bad).toEqual([])
  })

  it('el rayo frontal central también impacta con z > 0 (sanidad de la geometría)', () => {
    for (const n of ['Visitante', 'Ana', 'Daniel']) {
      const { probe } = buildProbe(n)
      const hit = front(probe, 0, 0)
      expect(hit).not.toBeNull()
      expect(hit!.point.z).toBeGreaterThan(0)
    }
  })
})
