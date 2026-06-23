// Tokens de diseño — paleta tropical "Lorito" 🦜 (espejo de las variables CSS)
export const T = {
  // marca
  verde: '#2bb673', verdeD: '#1e9e60', amarillo: '#ffc83d', coral: '#ff7a59',
  cielo: '#3fa9f5', morado: '#a06cf0', naranja: '#fb923c',
  // superficie / texto
  bg: '#fff7e9', card: '#ffffff', texto: '#3a3340', suave: '#8a8294', borde: '#efe3cf',
  // dimensiones (se mantienen consistentes con los resultados)
  d1: '#3fa9f5', d2: '#a06cf0', d3: '#fb923c',
  // estados
  ok: '#2bb673', warn: '#f5a623', err: '#ef5350',
  // forma
  radio: 22, sombra: '0 8px 20px rgba(0,0,0,0.08)',
}

// Color según puntaje (0-100) para refuerzo visual
export const colorScore = s =>
  s == null ? T.suave : s >= 70 ? T.verde : s >= 50 ? T.amarillo : T.coral
