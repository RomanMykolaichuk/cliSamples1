from flask import Flask, render_template

# Імпорт Blueprint з нашого модуля маршрутів
from app.routes.docs import docs_bp

def create_app():
    """Фабрика для створення екземпляру Flask додатку."""
    app = Flask(__name__)

    # Реєстрація Blueprint
    app.register_blueprint(docs_bp)

    @app.route("/")
    def index():
        return render_template("index.html")

    return app

if __name__ == '__main__':
    app = create_app()
    # debug=True для зручності розробки. У продакшені слід вимкнути.
    app.run(debug=True, port=5001)