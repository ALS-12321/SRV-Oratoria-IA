"""
Dimensión 2 — Análisis léxico y coherencia
  · detect_muletillas()  → muletillas verbales y tasa sobre total
  · calc_ttr()           → Type-Token Ratio (riqueza léxica)
  · calc_coherencia()    → coherencia entre oraciones (Jaccard)
Sin dependencias externas — funciona con stdlib Python.
"""
import re
from collections import Counter

# ─── Stopwords español (mínimas para TTR) ────────────────────────────────────
STOPWORDS = {
    "a", "al", "algo", "algunas", "algunos", "ante", "antes", "como", "con",
    "contra", "cual", "cuando", "de", "del", "desde", "donde", "durante",
    "e", "el", "ella", "ellas", "ellos", "en", "entre", "era", "es", "esa",
    "esas", "ese", "eso", "esos", "esta", "estas", "este", "esto", "estos",
    "fue", "han", "hasta", "hay", "he", "la", "las", "le", "les", "lo",
    "los", "mas", "me", "mi", "mis", "muy", "ni", "no", "nos", "o", "os",
    "para", "pero", "por", "que", "se", "si", "sin", "sobre", "son", "su",
    "sus", "también", "tan", "te", "tiene", "tienen", "todo", "todos",
    "tu", "un", "una", "unas", "unos", "ya", "y", "yo",
}

# ─── Lista de muletillas ──────────────────────────────────────────────────────
# Clave = palabra raíz, regex = captura variaciones elongadas
MULETILLAS_REGEX = [
    (r'\be+h+\b',                "eh"),
    (r'\ba+h+\b',                "ah"),
    (r'\be+m+\b',                "em"),
    (r'\bu+m+\b',                "um"),
    (r'\bm{2,}\b',               "mm"),
    (r'\best[e]+\b',             "este"),   # este, esteee
    (r'\bes+o+\b',               "eso"),
    (r'\bpu+es+\b',              "pues"),
    (r'\bbueno\b',               "bueno"),
    (r'\bosea\b|\bo sea\b',      "osea"),
    (r'\bentonces\b',            "entonces"),
    (r'\bdigamos\b',             "digamos"),
    (r'\bclaro\b',               "claro"),
    (r'\bverdad\b',              "verdad"),
    (r'\boye\b',                 "oye"),
    (r'\bmira\b',                "mira"),
]


def _normalizar(texto: str) -> str:
    """Minúsculas + quita signos de puntuación."""
    import unicodedata
    texto = texto.lower().strip()
    # normaliza caracteres acentuados a su base (para comparación)
    texto = unicodedata.normalize("NFKD", texto)
    texto = re.sub(r'[^\w\s]', ' ', texto)
    return texto


def detect_muletillas(transcripcion: str) -> dict:
    """
    Detecta muletillas verbales en la transcripción.
    Retorna count, tasa (%), lista de instancias y conteo por tipo.
    """
    texto = _normalizar(transcripcion)
    total_tokens = len(texto.split())
    if total_tokens == 0:
        return {"muletillas_count": 0, "muletillas_tasa": 0.0,
                "muletillas_list": [], "por_tipo": {}}

    encontradas = []
    por_tipo: dict[str, int] = {}

    for patron, etiqueta in MULETILLAS_REGEX:
        matches = re.findall(patron, texto)
        if matches:
            por_tipo[etiqueta] = por_tipo.get(etiqueta, 0) + len(matches)
            encontradas.extend(matches)

    count = sum(por_tipo.values())
    tasa = round(count / total_tokens * 100, 2)

    return {
        "muletillas_count": count,
        "muletillas_tasa": tasa,
        "muletillas_list": list(por_tipo.keys()),  # tipos únicos detectados
        "por_tipo": por_tipo,
    }


def calc_ttr(transcripcion: str) -> dict:
    """
    Type-Token Ratio — mide la variedad del vocabulario.
    Solo cuenta palabras con contenido (excluye stopwords y tokens < 2 chars).
    """
    texto = _normalizar(transcripcion)
    tokens_crudos = texto.split()
    tokens = [t for t in tokens_crudos if t not in STOPWORDS and len(t) >= 2]
    if not tokens:
        return {"word_count": 0, "unique_words": 0, "ttr_score": 0.0}

    types = set(tokens)
    ttr = len(types) / len(tokens)

    return {
        "word_count": len(tokens),
        "unique_words": len(types),
        "ttr_score": round(ttr, 3),
    }


def _palabras_set(oracion: str) -> set:
    """Palabras con contenido de una oración (sin stopwords, mín 2 chars)."""
    tokens = _normalizar(oracion).split()
    return {t for t in tokens if t not in STOPWORDS and len(t) >= 2}


def calc_coherencia(transcripcion: str) -> dict:
    """
    Coherencia local entre oraciones consecutivas via similitud Jaccard.
    Jaccard(A,B) = |A ∩ B| / |A ∪ B|
    Un score alto indica que las oraciones comparten vocabulario (ideas conectadas).
    """
    # Separar en oraciones por puntuación
    oraciones_raw = re.split(r'[.!?]+', transcripcion)
    oraciones = [o.strip() for o in oraciones_raw if len(o.strip()) > 8]

    if len(oraciones) < 2:
        # Con una sola oración no se puede calcular coherencia
        return {
            "coherencia_score": 0.75,  # valor neutral por defecto
            "oraciones_analizadas": len(oraciones),
            "nota": "texto demasiado corto para medir coherencia",
        }

    sims = []
    for i in range(len(oraciones) - 1):
        a = _palabras_set(oraciones[i])
        b = _palabras_set(oraciones[i + 1])
        union = a | b
        interseccion = a & b
        sim = len(interseccion) / len(union) if union else 0.0
        sims.append(round(sim, 3))

    score = round(sum(sims) / len(sims), 3)

    return {
        "coherencia_score": score,
        "oraciones_analizadas": len(oraciones),
        "similitudes": sims,
    }
