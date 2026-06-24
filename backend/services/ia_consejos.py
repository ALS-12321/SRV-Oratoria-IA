"""HU-25 — Retroalimentación con IA generativa (Claude Haiku).

Genera un consejo motivador en español simple para un niño de 1.° de primaria a
partir de sus SCORES. Principio ético clave: SOLO se envían números (puntajes y
métricas), NUNCA la voz ni la transcripción del menor.

DESACTIVADO por defecto (IA_GENERATIVA_ENABLED=0). Es defensivo: si está apagado,
falta la API key o la llamada falla, devuelve None y el llamador usa los consejos
por reglas (fallback).
"""
from loguru import logger

from config import IA_GENERATIVA_ENABLED, ANTHROPIC_API_KEY, IA_MODEL

_SYSTEM = (
    "Eres un asistente educativo que anima a niños de 6 a 7 años (primer grado de "
    "primaria) sobre su práctica de oratoria. Escribe en español muy simple y cálido, "
    "en segunda persona, con 2 o 3 frases cortas. No uses tecnicismos ni menciones "
    "números ni puntajes. Incluye una felicitación y un consejo concreto y sencillo "
    "para mejorar. Tono amable, como un maestro que motiva."
)


def _nivel(score):
    if score is None:
        return "sin dato"
    if score >= 70:
        return "bien"
    if score >= 50:
        return "regular"
    return "necesita mejorar"


def _construir_prompt(m: dict) -> str:
    """Arma el prompt SOLO con métricas numéricas (sin voz ni transcripción)."""
    return (
        "Resultados de la práctica de un niño (interprétalos, no menciones números):\n"
        f"- Fluidez al hablar: {_nivel(m.get('score_d1'))}\n"
        f"- Vocabulario y coherencia: {_nivel(m.get('score_d2'))}\n"
        f"- Expresividad de la voz: {_nivel(m.get('score_d3'))}\n"
        f"- Velocidad: {m.get('ppm', 'N/A')} palabras por minuto\n"
        f"- Bloqueos (pausas largas): {m.get('bloqueos', 'N/A')}\n"
        f"- Muletillas: {m.get('muletillas', 'N/A')}\n\n"
        "Escribe el mensaje de ánimo para el niño."
    )


def generar_consejo_ia(metricas: dict) -> str | None:
    """Devuelve un consejo generado por IA, o None si está desactivado/falla."""
    if not IA_GENERATIVA_ENABLED:
        return None
    if not ANTHROPIC_API_KEY:
        logger.warning("IA generativa activada pero falta ANTHROPIC_API_KEY")
        return None
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        msg = client.messages.create(
            model=IA_MODEL,
            max_tokens=300,
            system=_SYSTEM,
            messages=[{"role": "user", "content": _construir_prompt(metricas)}],
        )
        texto = "".join(
            b.text for b in msg.content if getattr(b, "type", "") == "text"
        ).strip()
        return texto or None
    except Exception as e:
        logger.warning(f"IA generativa falló: {e}")
        return None
