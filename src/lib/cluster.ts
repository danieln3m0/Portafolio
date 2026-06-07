// Señal hacia el fondo (BlobField) para agrupar las formas alrededor de un punto.
export function clusterOn(x: number, y: number) {
  window.dispatchEvent(new CustomEvent('blobcluster', { detail: { active: true, x, y } }))
}

export function clusterOff() {
  window.dispatchEvent(new CustomEvent('blobcluster', { detail: { active: false } }))
}

export type View = 'inicio' | 'proyectos' | 'detalle' | 'sobre-mi' | 'contacto'
