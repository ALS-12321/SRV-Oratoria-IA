import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const C = { bg: '#0f172a', card: '#1e293b', border: '#334155', text: '#f1f5f9', muted: '#94a3b8', blue: '#6366f1', green: '#22c55e', yellow: '#facc15', red: '#f87171' }

function colorEstrella(n) {
  if (n >= 4) return C.green
  if (n >= 3) return C.yellow
  return C.red
}

function MiniBarrasPPM({ sesiones }) {
  if (!sesiones.length) return null
  const max = Math.max(...sesiones.map(s => s.ppm || 0), 130)
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
      <p style={{ color: C.muted, fontSize: '13px', margin: '0 0 12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Evolucion de PPM (ultimas sesiones)</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
        {sesiones.slice().reverse().map((s, i) => {
          const ppm = s.ppm || 0
          const h = Math.max(4, (ppm / max) * 80)
          const ok = ppm >= 80 && ppm <= 120
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: C.muted }}>{ppm}</span>
              <div style={{ width: '100%', height: `${h}px`, borderRadius: '4px 4px 0 0', backgroundColor: ok ? C.green : ppm > 120 ? C.red : C.yellow, opacity: 0.8 }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#1a3a2a', border: `1px solid ${C.green}` }} />
        <span style={{ fontSize: '11px', color: C.muted }}>Zona ideal (80-120)</span>
      </div>
    </div>
  )
}

export default function Historial() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sesiones, setSesiones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/metrics/historial')
      .then(r => setSesiones(r.data))
      .catch(err => { if (err.response?.status === 401) navigate('/login') })
      .finally(() => setCargando(false))
  }, [])

  const promEstrellas = sesiones.length
    ? (sesiones.reduce((a, s) => a + (s.estrellas || 0), 0) / sesiones.length).toFixed(1)
    : '-'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'system-ui, sans-serif', padding: '32px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ color: C.text, margin: 0, fontSize: '22px' }}>Mi historial</h1>
            <p style={{ color: C.muted, margin: 0, fontSize: '14px' }}>{user?.nombre} {user?.apellido}</p>
          </div>
          <button onClick={() => navigate('/modos')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '13px' }}>
            ← Volver
          </button>
        </div>

        {/* Resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Practicas', valor: sesiones.length },
            { label: 'Promedio estrellas', valor: promEstrellas },
            { label: 'Bloqueos promedio', valor: sesiones.length ? (sesiones.reduce((a, s) => a + (s.long_pauses || 0), 0) / sesiones.length).toFixed(1) : '-' },
          ].map(({ label, valor }) => (
            <div key={label} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: C.text, margin: 0 }}>{valor}</p>
              <p style={{ fontSize: '12px', color: C.muted, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        <MiniBarrasPPM sesiones={sesiones} />

        {cargando && <p style={{ color: C.muted, textAlign: 'center' }}>Cargando...</p>}
        {!cargando && sesiones.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: C.muted, fontSize: '16px' }}>Aun no tienes practicas registradas</p>
            <button onClick={() => navigate('/modos')}
              style={{ marginTop: '12px', padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: C.blue, color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
              Hacer mi primera practica
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sesiones.map(s => (
            <div key={s.id} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, color: C.text, fontWeight: 'bold', fontSize: '14px' }}>
                  {s.modo === 'lectura' ? '📖 Lectura' : '🎙️ Expresion libre'}
                </p>
                <p style={{ margin: '2px 0 0', color: C.muted, fontSize: '12px' }}>
                  {new Date(s.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', color: colorEstrella(s.estrellas) }}>
                  {'★'.repeat(s.estrellas || 0)}{'☆'.repeat(5 - (s.estrellas || 0))}
                </div>
                <p style={{ margin: 0, color: C.muted, fontSize: '12px' }}>{s.ppm ? `${s.ppm} PPM` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
