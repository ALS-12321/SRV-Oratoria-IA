"""HU-25 — IA generativa: desactivada por defecto y sin fuga de datos sensibles."""
from services.ia_consejos import generar_consejo_ia, _construir_prompt


def test_ia_desactivada_devuelve_none():
    # Por defecto IA_GENERATIVA_ENABLED=0 -> no llama a la API, devuelve None
    r = generar_consejo_ia({"score_d1": 80, "score_d2": 70, "score_d3": 60,
                            "ppm": 95, "bloqueos": 0, "muletillas": 2})
    assert r is None


def test_prompt_solo_numeros_sin_transcripcion():
    # El prompt no debe contener voz ni transcripción, solo métricas
    prompt = _construir_prompt({"score_d1": 80, "score_d2": 70, "score_d3": 60,
                                "ppm": 95, "bloqueos": 0, "muletillas": 2})
    bajo = prompt.lower()
    assert "transcrip" not in bajo
    assert "95" in prompt          # sí incluye métricas numéricas
    assert "palabras por minuto" in bajo
