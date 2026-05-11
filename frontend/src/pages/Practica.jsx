import { useRef, useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js'
import api from '../api'

const C = {
  bg: '#0f172a', card: '#1e293b', border: '#334155', text: '#f1f5f9', muted: '#94a3b8',
  blue: '#6366f1', green: '#22c55e', greenBg: '#14532d', yellow: '#facc15', yellowBg: '#713f12',
  red: '#f87171', redBg: '#7f1d1d',
}
const THEME = {
  green:  { bg: C.greenBg,  border: C.green,  text: C.green },
  yellow: { bg: C.yellowBg, border: C.yellow, text: C.yellow },
  red:    { bg: C.redBg,    border: C.red,    text: C.red },
}

function hablar(texto) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(texto)
  u.lang = 'es-PE'; u.rate = 0.9
  window.speechSynthesis.speak(u)
}

function Estrellas({ n }) {
  return (
    <div style={{ fontSize: '36px', letterSpacing: '4px', margin: '8px 0' }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ opacity: i <= n ? 1 : 0.2 }}>★</span>)}
    </div>
  )
}

function BarraVelocidad({ ppm }) {
  const pct = Math.min(100, Math.max(0, ((ppm - 40) / 140) * 100))
  const zonaOkLeft = ((80 - 40) / 140) * 100
  const zonaOkWidth = (40 / 140) * 100
  const color = ppm >= 80 && ppm <= 120 ? C.green : ppm > 120 ? C.red : C.yellow
  return (
    <div style={{ margin: '12px 0' }}>
      <div style={{ position: 'relative', height: '28px', borderRadius: '999px', backgroundColor: '#1e293b', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: `${zonaOkLeft}%`, width: `${zonaOkWidth}%`, height: '100%', backgroundColor: '#14532d', opacity: 0.6 }} />
        <div style={{ position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)', top: '2px', bottom: '2px', width: '6px', borderRadius: '999px', backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: C.muted, marginTop: '4px' }}>
        <span>Muy lento</span><span style={{ color: C.green }}>Ideal: 80-120 PPM</span><span>Muy rapido</span>
      </div>
    </div>
  )
}

function DetallesDocente({ prosodia, ppm }) {
  const [abierto, setAbierto] = useState(false)
  const p = prosodia || {}
  return (
    <div style={{ marginTop: '12px', textAlign: 'left' }}>
      <button onClick={() => setAbierto(v => !v)}
        style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.muted, cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}>
        {abierto ? '▲' : '▼'} Ver datos tecnicos (para el docente)
      </button>
      {abierto && (
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: C.text }}>
            <tbody>
              {[
                ['PPM exacto', ppm?.ppm], ['Palabras', ppm?.word_count], ['Duracion', `${ppm?.speech_duration_s}s`],
                ['F0 promedio', p.f0_mean_hz ? `${p.f0_mean_hz} Hz` : 'N/A'],
                ['Jitter', p.jitter_pct != null ? `${p.jitter_pct}%` : 'N/A'],
                ['Shimmer', p.shimmer_db != null ? `${p.shimmer_db} dB` : 'N/A'],
                ['HNR', p.hnr_db != null ? `${p.hnr_db} dB` : 'N/A'],
              ].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '5px 8px', color: C.muted }}>{k}</td>
                  <td style={{ padding: '5px 8px', fontWeight: '500' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Resultados({ data }) {
  const fb = data.retroalimentacion
  const t = THEME[fb.color] || THEME.green
  const textoCompleto = `${fb.mensaje_principal} ${fb.detalle_velocidad} ${fb.detalle_pausas} ${fb.consejos.join(' ')}`

  return (
    <div style={{ maxWidth: '680px', margin: '20px auto', textAlign: 'center' }}>
      <div style={{ backgroundColor: t.bg, border: `2px solid ${t.border}`, borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
        <p style={{ fontSize: '26px', fontWeight: 'bold', color: t.text, margin: '0 0 4px' }}>{fb.mensaje_principal}</p>
        <Estrellas n={fb.estrellas} />
        <button onClick={() => hablar(textoCompleto)}
          style={{ marginTop: '8px', padding: '8px 20px', borderRadius: '999px', border: `1px solid ${t.border}`, backgroundColor: 'transparent', color: t.text, cursor: 'pointer', fontSize: '14px' }}>
          🔊 Escuchar resultado
        </button>
      </div>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', textAlign: 'left' }}>
        <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: C.text, fontSize: '15px' }}>Que tan rapido hablaste?</p>
        <BarraVelocidad ppm={data.ppm.ppm} />
        <p style={{ margin: '6px 0 0', color: C.muted, fontSize: '14px' }}>{fb.detalle_velocidad}</p>
        <p style={{ margin: '4px 0 0', color: C.muted, fontSize: '13px' }}>
          Dijiste <strong style={{ color: C.text }}>{data.ppm.word_count} palabras</strong> en <strong style={{ color: C.text }}>{data.ppm.speech_duration_s}s</strong>
        </p>
      </div>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', textAlign: 'left' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: C.text, fontSize: '15px' }}>Te quedaste sin palabras?</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: data.pausas.long_pauses === 0 ? C.green : C.red }}>{data.pausas.long_pauses}</p>
            <p style={{ fontSize: '12px', color: C.muted, margin: 0 }}>bloqueos</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: C.text }}>{data.pausas.total_pauses}</p>
            <p style={{ fontSize: '12px', color: C.muted, margin: 0 }}>pausas cortas</p>
          </div>
        </div>
        <p style={{ margin: '8px 0 0', color: C.muted, fontSize: '14px' }}>{fb.detalle_pausas}</p>
      </div>
      {fb.consejos.length > 0 && (
        <div style={{ backgroundColor: '#1e3a5f', border: '1px solid #2563eb', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', textAlign: 'left' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#93c5fd', fontSize: '15px' }}>💡 Para mejorar:</p>
          {fb.consejos.map((c, i) => <p key={i} style={{ margin: '4px 0', color: '#bfdbfe', fontSize: '14px' }}>• {c}</p>)}
        </div>
      )}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px 20px', textAlign: 'left' }}>
        <p style={{ margin: '0 0 6px', fontWeight: 'bold', color: C.muted, fontSize: '12px', textTransform: 'uppercase' }}>Lo que dijiste:</p>
        <p style={{ margin: 0, color: C.text, fontSize: '14px', lineHeight: '1.7', fontStyle: 'italic' }}>"{data.transcripcion || '(no se detecto texto)'}"</p>
      </div>
      <DetallesDocente prosodia={data.prosodia} ppm={data.ppm} />
    </div>
  )
}

export default function Practica() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const modo = params.get('modo') || 'libre'
  const textoId = params.get('texto_id')

  const [texto, setTexto] = useState(null)
  const containerRef = useRef(null)
  const wavesurferRef = useRef(null)
  const recordRef = useRef(null)
  const [grabando, setGrabando] = useState(false)
  const [analizando, setAnalizando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (modo === 'lectura' && textoId) {
      api.get('/audio/textos').then(r => {
        const t = r.data.find(x => x.id === parseInt(textoId))
        if (t) setTexto(t)
      })
    }
  }, [modo, textoId])

  const manejarGrabacion = async () => {
    if (!grabando) {
      if (wavesurferRef.current) wavesurferRef.current.destroy()
      setResultado(null); setError(null)
      const ws = WaveSurfer.create({ container: containerRef.current, waveColor: C.blue, height: 80 })
      const record = ws.registerPlugin(RecordPlugin.create())
      try {
        await record.startRecording()
        wavesurferRef.current = ws; recordRef.current = record
        setGrabando(true)
        hablar('Puedes empezar a hablar')
      } catch { setError('No se pudo acceder al microfono.') }
    } else {
      setGrabando(false)
      recordRef.current.stopRecording()
      recordRef.current.on('record-end', async blob => {
        setAnalizando(true)
        const formData = new FormData()
        formData.append('file', blob, 'practica.wav')
        formData.append('modo', modo)
        if (textoId) formData.append('texto_id', textoId)
        try {
          const res = await api.post('/audio/analizar', formData)
          setResultado(res.data)
          hablar(res.data.retroalimentacion.mensaje_principal)
        } catch (err) {
          if (err.response?.status === 401) { navigate('/login'); return }
          setError('Error al analizar. Verifica que el servidor este encendido.')
        } finally { setAnalizando(false) }
      })
    }
  }

  return (
    <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: C.bg, color: C.text, minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <button onClick={() => navigate('/modos')}
          style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0, display: 'block' }}>
          ← Cambiar modo
        </button>

        <h1 style={{ fontSize: '22px', margin: '0 0 4px' }}>
          {modo === 'lectura' ? '📖 Practica de lectura' : '🎙️ Expresion oral libre'}
        </h1>
        <p style={{ color: C.muted, margin: '0 0 20px', fontSize: '14px' }}>
          {modo === 'lectura' ? 'Lee el texto en voz alta' : 'Habla sobre el tema que quieras'}
        </p>

        {texto && (
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'left' }}>
            <p style={{ color: C.muted, fontSize: '12px', margin: '0 0 8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{texto.titulo}</p>
            <p style={{ color: C.text, fontSize: '16px', lineHeight: '1.8', margin: 0 }}>{texto.contenido}</p>
          </div>
        )}

        {modo === 'libre' && !resultado && (
          <div style={{ backgroundColor: '#1e3a5f', border: '1px solid #2563eb', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' }}>
            <p style={{ color: '#93c5fd', margin: 0, fontSize: '14px' }}>💡 Puedes hablar sobre: tu dia, tu animal favorito, tu familia, una pelicula que viste...</p>
          </div>
        )}

        <div ref={containerRef} style={{ margin: '0 auto 20px', width: '100%', minHeight: '80px', border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: C.card }} />

        <button onClick={manejarGrabacion} disabled={analizando}
          style={{ padding: '18px 48px', fontSize: '18px', fontWeight: 'bold', borderRadius: '999px', border: 'none',
            cursor: analizando ? 'not-allowed' : 'pointer',
            backgroundColor: analizando ? '#374151' : grabando ? '#dc2626' : C.blue,
            color: 'white', boxShadow: grabando ? '0 0 20px rgba(220,38,38,0.5)' : analizando ? 'none' : `0 0 20px rgba(99,102,241,0.4)` }}>
          {analizando ? 'Analizando...' : grabando ? '⏹  Listo, analizar' : '🎤  Empezar a hablar'}
        </button>

        {grabando && <p style={{ color: C.red, marginTop: '12px', fontSize: '15px' }}>Grabando... cuando termines presiona el boton</p>}
        {analizando && <p style={{ color: C.muted, marginTop: '16px', fontSize: '14px' }}>Procesando tu voz, espera un momento...</p>}
        {error && <div style={{ marginTop: '16px', backgroundColor: C.redBg, border: `1px solid ${C.red}`, borderRadius: '10px', padding: '12px 16px', color: C.red, fontSize: '14px' }}>{error}</div>}
        {resultado && <Resultados data={resultado} />}

        {resultado && (
          <button onClick={() => navigate('/historial')}
            style={{ marginTop: '16px', padding: '12px 28px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '14px' }}>
            Ver mi historial →
          </button>
        )}
      </div>
    </div>
  )
}
