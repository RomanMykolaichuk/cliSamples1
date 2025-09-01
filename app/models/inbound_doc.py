from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class InboundDoc:
    """
    Модель даних, що представляє запис у таблиці 'inbound_docs'.
    """
    doc_reference: str
    classification: str
    summary: str
    source_type: Optional[str] = None
    analyst_notes: Optional[str] = None
    priority: int = 3
    id: Optional[int] = None  # Генерується базою даних
    received_at: Optional[datetime] = None  # Встановлюється базою даних за замовчуванням