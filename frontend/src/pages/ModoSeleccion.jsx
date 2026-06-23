import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { T } from '../ui/theme'
import { Lorito, Boton } from '../ui/kit'

function PillBtn({ children, onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding: '9px 16px', borderRadius: 999, border: `2px solid ${T.borde}`, background: '#fff', color: T.suave, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
      {children}
    </button>
  )
}

function TarjetaModo({ icon, titulo, desc, color, onClick }) {
  return (
    <button onClick={onClick} className="pop"
      style={{
        background: '#fff', border: `3px solid ${color}`, borderRadius: 24, padding: '26px 18px',
        cursor: 'pointer', textAlign: 'center', boxShadow: T.sombra, transition: 'transform .1s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}>
      <div style={{ fontSize: 56, marginBottom: 10 }}>{icon}</div>
      <p style={{ color, fontWeight: 800, fontSize: 'clamp(18px,5vw,22px)', margin: '0 0 6px', fontFamily: "'Baloo 2', sans-serif" }}>{titulo}</p>
      <p style={{ color: T.suave, fontSize: 14, margin: 0, lineHeight: 1.4 }}>{desc}</p>
    </button>
  )
}

export default function ModoSeleccion() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [textos, setTextos] = useState([])
  const [textoSeleccionado, setTextoSeleccionado] = useState(null)
  const [paso, setPaso] = useState('modos')

  useEffect(() => {
    api.get('/audio/textos').then(r => setTextos(r.data)).catch(() => {})
  }, [])

  const irAPractica = (modo, textoId = null) => {
    const params = new URLSearchParams({ modo })
    if (textoId) params.set('texto_id', textoId)
    navigate(`/practica?${params}`)
  }

  return (
    <div style={{ minHeight: '100svh', padding: '20px 18px 40px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px,5.5vw,30px)' }}>¡Hola, {user?.nombre}! 👋</h1>
            {user?.grado && <p style={{ color: T.suave, margin: 0, fontWeight: 700 }}>{user.grado} {user.seccion || ''}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <PillBtn onClick={() => navigate('/historial')}>📊 Mi historial</PillBtn>
            <PillBtn onClick={logout}>Salir</PillBtn>
          </div>
        </div>

        {paso === 'modos' && (
          <div className="aparecer">
            <Lorito size={84} mensaje="¿Qué quieres practicar hoy?" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 18 }}>
              <TarjetaModo icon="📖" titulo="Lectura" color={T.cielo}
                desc="Lee un cuento que te damos en voz alta" onClick={() => setPaso('lectura')} />
              <TarjetaModo icon="🎤" titulo="Hablar libre" color={T.verde}
                desc="Habla sobre lo que tú quieras" onClick={() => irAPractica('libre')} />
            </div>
          </div>
        )}

        {paso === 'lectura' && (
          <div className="aparecer">
            <PillBtn onClick={() => { setPaso('modos'); setTextoSeleccionado(null) }}>← Volver</PillBtn>
            <h2 style={{ margin: '16px 0 4px' }}>Elige un cuento 📖</h2>
            <p style={{ color: T.suave, margin: '0 0 18px' }}>Lo leerás en voz alta cuando estés listo</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {textos.map(t => {
                const sel = textoSeleccionado === t.id
                return (
                  <button key={t.id} onClick={() => setTextoSeleccionado(sel ? null : t.id)}
                    style={{
                      textAlign: 'left', padding: '16px 18px', borderRadius: 18, cursor: 'pointer',
                      border: `3px solid ${sel ? T.cielo : T.borde}`,
                      background: sel ? '#eaf5ff' : '#fff', boxShadow: T.sombra,
                    }}>
                    <p style={{ color: T.texto, fontWeight: 800, margin: '0 0 4px', fontSize: 16 }}>
                      {sel ? '✅ ' : '📄 '}{t.titulo}
                    </p>
                    <p style={{ color: T.suave, margin: 0, fontSize: 13, lineHeight: 1.5 }}>{t.contenido.substring(0, 90)}…</p>
                  </button>
                )
              })}
            </div>

            {textoSeleccionado && (
              <div style={{ marginTop: 18 }}>
                <Boton color={T.cielo} onClick={() => irAPractica('lectura', textoSeleccionado)}>▶  ¡Comenzar a leer!</Boton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
