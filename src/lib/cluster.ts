// Señal hacia el fondo (BlobField) para que las formas hagan "splash" sobre un
// punto (el nombre). Se pasa el ancho/alto del nombre para repartir el chapoteo.
export function clusterOn(x: number, y: number, w = 0, h = 0) {
  window.dispatchEvent(new CustomEvent('blobcluster', { detail: { active: true, x, y, w, h } }))
}

export function clusterOff() {
  window.dispatchEvent(new CustomEvent('blobcluster', { detail: { active: false } }))
}

export type View = 'inicio' | 'proyectos' | 'detalle' | 'sobre-mi' | 'contacto'

// Señal de vista actual: el fondo agrupa las formas en "proyectos", se opaca en
// "detalle" y tiñe su color según el proyecto activo.
export function blobView(view: View, project: number) {
  window.dispatchEvent(new CustomEvent('blobview', { detail: { view, project } }))
}

// Cambia solo el color del fondo al recorrer proyectos (sin cambiar de vista).
export function blobProject(project: number) {
  window.dispatchEvent(new CustomEvent('blobproject', { detail: { project } }))
}
