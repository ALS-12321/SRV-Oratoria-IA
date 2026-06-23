import { T } from './theme'

/* Contenedor de pantalla centrado y responsive */
export function Pantalla({ children, ancho = 460 }) {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="aparecer" style={{ width: '100%', maxWidth: ancho }}>{children}</div>
    </div>
  )
}

/* Mascota Lorito 🦜 con burbuja de mensaje opcional */
export function Lorito({ size = 96, mensaje }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 14 }}>
      <div className="flotar" style={{
        width: size, height: size, margin: '0 auto', borderRadius: '50%',
        background: 'linear-gradient(160deg,#d9f7e6,#fff3cf)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.55, boxShadow: T.sombra, border: '3px solid #fff',
      }}>🦜</div>
      {mensaje && (
        <div style={{
          display: 'inline-block', marginTop: 10, background: '#fff', color: T.texto,
          padding: '8px 16px', borderRadius: 16, boxShadow: T.sombra, fontWeight: 700,
          fontSize: 'clamp(14px,3.5vw,17px)',
        }}>{mensaje}</div>
      )}
    </div>
  )
}

export function Tarjeta({ children, style }) {
  return (
    <div style={{ background: T.card, borderRadius: T.radio, padding: 'clamp(18px,5vw,28px)', boxShadow: T.sombra, ...style }}>
      {children}
    </div>
  )
}

export function Boton({ children, onClick, type = 'button', color = T.verde, variant = 'solid', disabled, full = true, style }) {
  const base = {
    width: full ? '100%' : undefined, minHeight: 56, borderRadius: 999, fontWeight: 800,
    fontSize: 'clamp(16px,4vw,19px)', padding: '12px 22px', border: 'none',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
    transition: 'transform .08s', ...style,
  }
  const skins = {
    solid:   { background: color, color: '#fff', boxShadow: '0 5px 0 rgba(0,0,0,0.15)' },
    outline: { background: '#fff', color, border: `2.5px solid ${color}` },
  }
  const press = on => e => { if (!disabled) e.currentTarget.style.transform = on ? 'translateY(2px)' : '' }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseDown={press(true)} onMouseUp={press(false)} onMouseLeave={press(false)}
      style={{ ...base, ...skins[variant] }}>
      {children}
    </button>
  )
}

export function Campo({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14, textAlign: 'left' }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: 14, color: T.suave, marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', minHeight: 52, padding: '12px 16px', borderRadius: 16,
          border: `2px solid ${T.borde}`, background: '#fffdf8', color: T.texto,
          fontFamily: 'inherit', fontSize: 'clamp(15px,4vw,17px)', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

export function Estrellas({ n = 0, size = 34 }) {
  return (
    <div style={{ fontSize: size, letterSpacing: 4, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= n ? T.amarillo : '#e8e0cf' }}>★</span>
      ))}
    </div>
  )
}
