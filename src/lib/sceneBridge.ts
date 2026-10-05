// Puente entre la escena 3D (carga diferida) y la vista "Tu forma": la escena
// registra cómo sacar una instantánea de la supershape y avisa al estar lista.

let snapshotFn: (() => string | null) | null = null

export function registerSnapshot(fn: (() => string | null) | null) {
  snapshotFn = fn
  if (fn) window.dispatchEvent(new Event('scene-ready'))
}

export function takeSnapshot(): string | null {
  return snapshotFn ? snapshotFn() : null
}
