from flask import Blueprint, request, jsonify
from dataclasses import asdict

from app.db import get_all_docs, create_doc, delete_doc_by_id
from app.models.inbound_doc import InboundDoc

# Створення Blueprint для маршрутів, пов'язаних з документами
docs_bp = Blueprint('docs', __name__, url_prefix='/api/docs')

@docs_bp.route('', methods=['GET'])
def list_documents():
    """GET /api/docs — отримує список всіх документів."""
    try:
        documents = get_all_docs()
        # asdict перетворює список dataclass об'єктів у список словників
        return jsonify([asdict(doc) for doc in documents])
    except Exception as e:
        return jsonify({"error": f"Помилка на сервері: {e}"}), 500

@docs_bp.route('', methods=['POST'])
def create_document():
    """POST /api/docs — створює новий документ."""
    data = request.get_json()
    if not data or not data.get('doc_reference') or not data.get('classification') or not data.get('summary'):
        return jsonify({"error": "Відсутні обов'язкові поля: doc_reference, classification, summary"}), 400

    try:
        # Створення екземпляру моделі з отриманих даних
        new_doc = InboundDoc(
            doc_reference=data['doc_reference'],
            classification=data['classification'],
            summary=data['summary'],
            source_type=data.get('source_type'),
            analyst_notes=data.get('analyst_notes'),
            priority=data.get('priority', 3)
        )
        created_doc = create_doc(new_doc)
        return jsonify(asdict(created_doc)), 201
    except Exception as e:
        return jsonify({"error": f"Помилка створення запису: {e}"}), 500

@docs_bp.route('/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id: int):
    """DELETE /api/docs/{id} — видаляє документ за ID."""
    try:
        deleted_count = delete_doc_by_id(doc_id)
        if deleted_count == 0:
            return jsonify({"error": f"Документ з ID {doc_id} не знайдено"}), 404
        
        return jsonify({"message": f"Документ з ID {doc_id} успішно видалено"}), 200
    except Exception as e:
        return jsonify({"error": f"Помилка видалення запису: {e}"}), 500