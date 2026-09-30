# apps/api/app/__init__.py
from pathlib import Path
from dotenv import load_dotenv

# Search current directory and project root for .env
load_dotenv()
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent.parent / ".env")
