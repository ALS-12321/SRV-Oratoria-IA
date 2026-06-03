"""
Scoring y retroalimentación de la Dimensión 2 (Léxico y Coherencia).
score_d2: 0-100
  · muletillas  (0-40 pts)
  · TTR          (0-35 pts)
  · coherencia   (0-25 pts)
"""

# ─── Umbrales ─────────────────────────────────────────────────────────────────
MUL_EXCELENTE = 1   # 0-1 muletillas → 40 pts
MUL_BUENO     = 4   # 2-4            → 25 pts
MUL_REGULAR   = 8   # 5-8            → 10 pts
                    # 9+             →  0 pts

TTR_BUENO    = 0.50  # >0.50  → 35 pts
TTR_REGULAR  = 0.30  # >0.30  → 20 pts
                     # ≤0.30  →  5 pts

COH_BUENO    = 0.35  # >0.35  → 25 pts
COH_REGULAR  = 0.15  # >0.15  → 15 pts
                     # ≤0.15  →  5 pts


def _pts_muletillas(count: int) -> int:
    if count <= MUL_EXCELENTE:  return 40
    if count <= MUL_BUENO:      return 25
    if count <= MUL_REGULAR:    return 10
    return 0


def _pts_ttr(ttr: float) -> int:
    if ttr > TTR_BUENO:    return 35
    if ttr > TTR_REGULAR:  return 20
    return 5


def _pts_coherencia(score: float) -> int:
    if score > COH_BUENO:    return 25
    if score > COH_REGULAR:  return 15
    return 5


def score_to_stars(score: float) -> int:
    if score >= 85: return 5
    if score >= 70: return 4
    if score >= 50: return 3
    if score >= 30: return 2
    return 1


def generate_feedback_d2(muletillas: dict, ttr: dict, coherencia: dict) -> dict:
    count     = muletillas.get("muletillas_count", 0)
    tasa      = muletillas.get("muletillas_tasa", 0.0)
    ttr_score = ttr.get("ttr_score", 0.0)
    coh_score = coherencia.get("coherencia_score", 0.0)

    pts_mul = _pts_muletillas(count)
    pts_ttr = _pts_ttr(ttr_score)
    pts_coh = _pts_coherencia(coh_score)
    score_d2 = float(pts_mul + pts_ttr + pts_coh)  # 0-100
    estrellas = score_to_stars(score_d2)

    # Mensajes de muletillas
    if count == 0:
        msg_muletillas = "No usaste ninguna muletilla. Excelente!"
        consejo_mul = None
    elif count <= 3:
        tipos = ", ".join(muletillas.get("muletillas_list", []))
        msg_muletillas = f"Usaste {count} muletilla(s) ({tipos}). Casi perfecto."
        consejo_mul = "Antes de hablar, practica hacer una pausa corta en vez de decir 'este' o 'eh'."
    else:
        tipos = ", ".join(muletillas.get("muletillas_list", []))
        msg_muletillas = f"Usaste {count} muletillas ({tipos}). Hay que practicar mas."
        consejo_mul = "Graba tu voz, escuchala y nota cuando dices 'este' o 'eh'. Practica parar ahi."

    # Mensajes de TTR
    if ttr_score > TTR_BUENO:
        msg_ttr = "Usas palabras muy variadas. Tienes buen vocabulario!"
        consejo_ttr = None
    elif ttr_score > TTR_REGULAR:
        msg_ttr = "Tu vocabulario es adecuado para tu nivel."
        consejo_ttr = "Lee cuentos nuevos para conocer mas palabras."
    else:
        msg_ttr = "Repites muchas palabras. Intenta usar palabras diferentes."
        consejo_ttr = "Cada dia aprende 2 palabras nuevas y usaias cuando hables."

    # Mensajes de coherencia
    if coh_score > COH_BUENO:
        msg_coh = "Tus ideas estan bien conectadas. Se entiende lo que dices!"
        consejo_coh = None
    elif coh_score > COH_REGULAR:
        msg_coh = "Tus ideas tienen sentido en general."
        consejo_coh = "Intenta usar palabras como 'porque', 'entonces' o 'despues' para conectar ideas."
    else:
        msg_coh = "Tus ideas saltan de un tema a otro. Trata de organizarlas."
        consejo_coh = "Antes de hablar, piensa: primero digo esto, luego aquello."

    consejos = [c for c in [consejo_mul, consejo_ttr, consejo_coh] if c]

    return {
        "score_d2": score_d2,
        "estrellas": estrellas,
        "detalle_muletillas": msg_muletillas,
        "detalle_vocabulario": msg_ttr,
        "detalle_coherencia": msg_coh,
        "consejos": consejos,
        "breakdown": {
            "pts_muletillas": pts_mul,
            "pts_ttr": pts_ttr,
            "pts_coherencia": pts_coh,
        },
    }
