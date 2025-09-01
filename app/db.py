import psycopg2
from psycopg2.extras import DictCursor
from contextlib import contextmanager
from typing import List, Optional

# Імпорт конфігурації та моделі даних
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
from app.models.inbound_doc import InboundDoc

# Формування рядка підключення (DSN - Data Source Name)
DSN = f"dbname='{DB_NAME}' user='{DB_USER}' password='{DB_PASSWORD}' host='{DB_HOST}' port='{DB_PORT}'"

@contextmanager
def get_db_connection():
    """
    Надає з'єднання з базою даних у вигляді контекстного менеджера.
    Гарантує, що з'єднання буде закрито після використання.
    """
    conn = None
    try:
        conn = psycopg2.connect(DSN)
        yield conn
    except psycopg2.OperationalError as e:
        print(f"Помилка підключення до бази даних: {e}")
        raise
    finally:
        if conn:
            conn.close()

def _map_row_to_model(row: DictCursor) -> Optional[InboundDoc]:
    """Допоміжна функція для перетворення рядка з БД на модель InboundDoc."""
    if not row:
        return None
    return InboundDoc(**row)

def get_doc_by_id(doc_id: int) -> Optional[InboundDoc]:
    """
    Отримує один вхідний документ за його ID.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT * FROM inbound_docs WHERE id = %s;", (doc_id,))
            row = cur.fetchone()
            return _map_row_to_model(row)

def get_all_docs() -> List[InboundDoc]:
    """
    Отримує всі документи з таблиці inbound_docs.
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT * FROM inbound_docs ORDER BY received_at DESC;")
            rows = cur.fetchall()
            return [_map_row_to_model(row) for row in rows]

def create_doc(doc: InboundDoc) -> InboundDoc:
    """
    Додає новий документ до таблиці inbound_docs.
    Повертає створений об'єкт з ID та датою, присвоєними базою даних.
    """
    sql = """
        INSERT INTO inbound_docs (doc_reference, classification, summary, source_type, analyst_notes, priority)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, received_at;
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (
                doc.doc_reference, doc.classification, doc.summary,
                doc.source_type, doc.analyst_notes, doc.priority
            ))
            new_id, received_at = cur.fetchone()
            conn.commit()
            
            doc.id = new_id
            doc.received_at = received_at
            return doc

def delete_doc_by_id(doc_id: int) -> int:
    """
    Видаляє документ за його ID.
    Повертає кількість видалених рядків (0 або 1).
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM inbound_docs WHERE id = %s;", (doc_id,))
            row_count = cur.rowcount
            conn.commit()
            return row_count