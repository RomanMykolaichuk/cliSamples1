import os
from dotenv import load_dotenv

# Визначаємо шлях до кореневої папки проєкту
basedir = os.path.abspath(os.path.dirname(__file__))

# Завантажуємо змінні оточення з файлу .env
load_dotenv(os.path.join(basedir, '.env'))

# Отримуємо змінні оточення
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')