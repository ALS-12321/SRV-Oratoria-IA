import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const C = { bg: '#0f172a', card: '#1e293b', border: '#334155', text: '#f1f5f9', muted: '#94a3b8', blue: '#6366f1', green: '#22c55e' }

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
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'system-ui, sans-serif', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: C.text, margin: 0, fontSize: '22px' }}>Hola, {user?.nombre}!</h1>
          <p style={{ color: C.muted, margin: 0, fontSize: '14px' }}>{user?.grado && `${user.grado} ${user.seccion || ''}`}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/historial')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '13px' }}>
            Mi historial
          </button>
          <button onClick={logout}
            style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '13px' }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {paso === 'modos' && (
          <>
            <h2 style={{ color: C.text, textAlign: 'center', marginBottom: '8px' }}>Que quieres practicar hoy?</h2>
            <p style={{ color: C.muted, textAlign: 'center', marginBottom: '32px', fontSize: '15px' }}>Elige un modo de practica</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button onClick={() => setPaso('lectura')}
                style={{ padding: '32px 20px', borderRadius: '16px', border: `2px solid ${C.blue}`, backgroundColor: '#1e1b4b', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📖</div>
                <p style={{ color: C.text, fontWeight: 'bold', fontSize: '18px', margin: '0 0 6px' }}>Lectura</p>
                <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>Lee un texto que te damos y recibe retroalimentacion</p>
              </button>
              <button onClick={() => irAPractica('libre')}
                style={{ padding: '32px 20px', borderRadius: '16px', border: `2px solid ${C.green}`, backgroundColor: '#14532d22', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎙️</div>
                <p style={{ color: C.text, fontWeight: 'bold', fontSize: '18px', margin: '0 0 6px' }}>Expresion libre</p>
                <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>Habla sobre cualquier tema que quieras</p>
              </button>
            </div>
          </>
        )}

        {paso === 'lectura' && (
          <>
            <button onClick={() => setPaso('modos')}
              style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '14px', marginBottom: '20px', padding: 0 }}>
              ← Volver
            </button>
            <h2 style={{ color: C.text, marginBottom: '8px' }}>Elige un texto para leer</h2>
            <p style={{ color: C.muted, marginBottom: '24px', fontSize: '14px' }}>Lee el texto en voz alta cuando estés listo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {textos.map(t => (
                <div key={t.id} onClick={() => setTextoSeleccionado(t.id === textoSeleccionado ? null : t.id)}
                  style={{ padding: '16px 20px', borderRadius: '12px', border: `2px solid ${textoSeleccionado === t.id ? C.blue : C.border}`, backgroundColor: textoSeleccionado === t.id ? '#1e1b4b' : C.card, cursor: 'pointer' }}>
                  <p style={{ color: C.text, fontWeight: 'bold', margin: '0 0 6px', fontSize: '15px' }}>{t.titulo}</p>
                  <p style={{ color: C.muted, margin: 0, fontSize: '13px', lineHeight: '1.5' }}>{t.contenido.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
            {textoSeleccionado && (
              <button onClick={() => irAPractica('lectura', textoSeleccionado)}
                style={{ marginTop: '20px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: C.blue, color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                Comenzar lectura →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
