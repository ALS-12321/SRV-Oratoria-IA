import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const C = { bg: '#0f172a', card: '#1e293b', border: '#334155', text: '#f1f5f9', muted: '#94a3b8', blue: '#6366f1', err: '#f87171' }

function Campo({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: '14px', textAlign: 'left' }}>
      <label style={{ display: 'block', fontSize: '13px', color: C.muted, marginBottom: '4px' }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: '#0f172a', color: C.text, fontSize: '15px', boxSizing: 'border-box' }}
      />
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState('login')
  const [form, setForm] = useState({ nombre: '', apellido: '', username: '', password: '', grado: '', seccion: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setCargando(true); setError('')
    try {
      const url = modo === 'login' ? '/auth/login' : '/auth/register'
      const body = modo === 'login'
        ? { username: form.username, password: form.password }
        : form
      const res = await api.post(url, body)
      login(res.data.access_token, res.data.user)
      navigate('/modos')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '420px' }}>
        <h1 style={{ color: C.text, textAlign: 'center', margin: '0 0 4px', fontSize: '22px' }}>SRV - Oratoria</h1>
        <p style={{ color: C.muted, textAlign: 'center', margin: '0 0 24px', fontSize: '14px' }}>Sistema de Retroalimentacion por Voz</p>

        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}`, marginBottom: '24px' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setModo(m); setError('') }}
              style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: modo === m ? C.blue : 'transparent', color: modo === m ? 'white' : C.muted }}>
              {m === 'login' ? 'Iniciar sesion' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {modo === 'register' && (
            <>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><Campo label="Nombre" value={form.nombre} onChange={set('nombre')} /></div>
                <div style={{ flex: 1 }}><Campo label="Apellido" value={form.apellido} onChange={set('apellido')} /></div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><Campo label="Grado" value={form.grado} onChange={set('grado')} placeholder="1ro" /></div>
                <div style={{ flex: 1 }}><Campo label="Seccion" value={form.seccion} onChange={set('seccion')} placeholder="A" /></div>
              </div>
            </>
          )}
          <Campo label="Usuario" value={form.username} onChange={set('username')} placeholder="mi.usuario" />
          <Campo label="Contrasena" type="password" value={form.password} onChange={set('password')} />

          {error && <p style={{ color: C.err, fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}

          <button type="submit" disabled={cargando}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: C.blue, color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: cargando ? 'not-allowed' : 'pointer', opacity: cargando ? 0.7 : 1 }}>
            {cargando ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
