"""Filtros de procesamiento de audio para mitigar el ruido del aula rural (Project Charter).

Implementados en numpy puro (sin scipy) para no añadir dependencias compiladas:
  - Filtro paso-alto Butterworth de 2º orden: elimina el rumor/zumbido de baja
    frecuencia (DC, corriente, ventiladores) por debajo de la voz infantil (~250-400 Hz).
  - Puerta de ruido (noise gate) suave: atenua los tramos de silencio con ruido
    ambiental, conservando el habla (umbral conservador para no dañar la transcripcion).
"""
import numpy as np

# Frecuencia de corte del paso-alto: muy por debajo del F0 infantil, solo limpia rumor.
HIGHPASS_HZ = 80.0
# Puerta de ruido (valores conservadores: no deben suprimir voz suave del niño).
GATE_FRAME_MS = 20      # ventana de analisis
GATE_PERCENTILE = 12    # percentil de energia usado como piso de ruido
GATE_MARGIN = 1.6       # cuanto sobre el piso de ruido se considera "voz"
GATE_FLOOR = 0.20       # ganancia minima (no se silencia del todo, evita clics)


def _highpass_biquad(x: np.ndarray, fs: int, fc: float = HIGHPASS_HZ, q: float = 0.70710678) -> np.ndarray:
    """Paso-alto Butterworth (biquad RBJ, Q=1/sqrt(2)) aplicado por recursion."""
    w0 = 2.0 * np.pi * fc / fs
    cosw, sinw = np.cos(w0), np.sin(w0)
    alpha = sinw / (2.0 * q)
    b0 = (1.0 + cosw) / 2.0
    b1 = -(1.0 + cosw)
    b2 = (1.0 + cosw) / 2.0
    a0 = 1.0 + alpha
    a1 = -2.0 * cosw
    a2 = 1.0 - alpha
    b0, b1, b2, a1, a2 = b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0

    y = np.empty_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i in range(x.shape[0]):
        xi = float(x[i])
        yi = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1 = x1, xi
        y2, y1 = y1, yi
        y[i] = yi
    return y


def _noise_gate(x: np.ndarray, fs: int) -> np.ndarray:
    """Atenua los tramos por debajo del piso de ruido estimado (envolvente suavizada)."""
    n = x.shape[0]
    fl = max(1, int(fs * GATE_FRAME_MS / 1000))
    if n < fl * 4:
        return x

    nf = n // fl
    frames = x[: nf * fl].reshape(nf, fl)
    rms = np.sqrt(np.mean(frames.astype(np.float64) ** 2, axis=1) + 1e-9)

    noise = np.percentile(rms, GATE_PERCENTILE)
    thr = noise * GATE_MARGIN
    gain = np.where(rms >= thr, 1.0, GATE_FLOOR)

    # Suaviza la ganancia (attack/release) para evitar clics entre frames.
    k = np.array([0.25, 0.5, 0.25])
    gain = np.convolve(gain, k, mode="same")

    gain_samp = np.repeat(gain, fl)
    if gain_samp.shape[0] < n:
        gain_samp = np.concatenate([gain_samp, np.full(n - gain_samp.shape[0], gain[-1])])
    return x * gain_samp[:n]


def apply_filters(audio_int16: np.ndarray, fs: int, highpass_hz: float = HIGHPASS_HZ) -> np.ndarray:
    """Aplica paso-alto + puerta de ruido a un PCM int16 mono. Devuelve int16.

    Es defensivo: si algo falla, se devuelve el audio original sin filtrar.
    """
    try:
        x = audio_int16.astype(np.float32)
        x = _highpass_biquad(x, fs, fc=highpass_hz)
        x = _noise_gate(x, fs)
        x = np.clip(x, -32768, 32767)
        return x.astype(np.int16)
    except Exception:
        return audio_int16
