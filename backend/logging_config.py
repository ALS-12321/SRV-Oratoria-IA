"""
Configuración de logging estructurado (TA-021).

Sink principal: stdout → Railway lo captura en Deploy Logs.
Sink de archivo con rotación diaria: SOLO si LOG_DIR está definido (VPS con disco
persistente); en Railway el filesystem es efímero, así que se omite por defecto.
"""
import logging
import os
import sys

from loguru import logger


class _InterceptHandler(logging.Handler):
    """Redirige los logs del stdlib (uvicorn, sqlalchemy) a loguru."""
    def emit(self, record: logging.LogRecord):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        logger.opt(depth=6, exception=record.exc_info).log(level, record.getMessage())


def setup_logging():
    nivel = os.getenv("LOG_LEVEL", "INFO")

    logger.remove()
    # Sink principal: stdout (capturado por Railway)
    logger.add(
        sys.stdout, level=nivel, backtrace=False, diagnose=False,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level:<7}</level> | {message}",
    )

    # Sink de archivo con rotación: solo si hay disco persistente (no en Railway)
    log_dir = os.getenv("LOG_DIR")
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)
        logger.add(
            os.path.join(log_dir, "srv_{time:YYYY-MM-DD}.log"),
            rotation="1 day", retention="14 days", level=nivel, enqueue=True,
        )

    # Capturar logs del stdlib (uvicorn / sqlalchemy) y mandarlos a loguru
    logging.basicConfig(handlers=[_InterceptHandler()], level=0, force=True)
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "sqlalchemy.engine"):
        logging.getLogger(name).handlers = [_InterceptHandler()]

    return logger
