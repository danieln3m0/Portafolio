import type { SupershapeParams } from './supershape'

// Señal hacia el fondo (Scene3D) para que las formas hagan "splash" sobre un
// punto (el nombre). Se pasa el ancho/alto del nombre para repartir el chapoteo.
export function clusterOn(x: number, y: number, w = 0, h = 0) {
  window.dispatchEvent(new CustomEvent('blobcluster', { detail: { active: true, x, y, w, h } }))
}

export function clusterOff() {
  window.dispatchEvent(new CustomEvent('blobcluster', { detail: { active: false } }))
}

export type View = 'inicio' | 'proyectos' | 'detalle' | 'sobre-mi' | 'tu-forma' | 'contacto' | 'reclutador'

// Señal de vista actual: el fondo materializa el modelo del proyecto en
// "proyectos", la supershape en "tu-forma" y se opaca en "detalle"/"reclutador".
export function blobView(view: View, project: number) {
  window.dispatchEvent(new CustomEvent('blobview', { detail: { view, project } }))
}

// Cambia el modelo materializado al recorrer proyectos (sin cambiar de vista).
export function blobProject(project: number) {
  window.dispatchEvent(new CustomEvent('blobproject', { detail: { project } }))
}

// Parámetros de la supershape de "Tu forma" (se guardan aunque la vista aún no esté activa).
export function blobSupershape(params: SupershapeParams) {
  window.dispatchEvent(new CustomEvent('blobshape', { detail: { params } }))
}
