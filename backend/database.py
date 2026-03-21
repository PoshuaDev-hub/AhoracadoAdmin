import os
import httpx
from dotenv import load_dotenv

# Cargar el .env desde la raíz
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, "../.env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Configuración de cabeceras para hablar con Supabase
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def create_supabase_game(data):
    """Crea una nueva partida en la tabla 'games'"""
    url = f"{SUPABASE_URL}/rest/v1/games"
    
    # Aseguramos que el objeto inicial coincida con las columnas de tu DB
    # Nota: Aquí usamos 'attempts' en lugar de 'errors'
    initial_data = {
        "room_code": data.get("room_code"),
        "word": data.get("word"),
        "guessed_letters": [],
        "attempts": 0, # Nombre exacto en tu SQL
        "status": "playing"
    }

    custom_headers = {
        **headers,
        "Prefer": "return=representation"
    }
    
    with httpx.Client() as client:
        response = client.post(url, json=initial_data, headers=custom_headers)
        
        if response.status_code != 201:
            print(f"ERROR AL CREAR: {response.text}")
            return None
            
        res_data = response.json()
        return res_data[0] if isinstance(res_data, list) else res_data

def get_supabase_game(room_code):
    """Obtiene una partida por su código de sala"""
    url = f"{SUPABASE_URL}/rest/v1/games?room_code=eq.{room_code}"
    with httpx.Client() as client:
        response = client.get(url, headers=headers)
        data = response.json()
        return data[0] if data else None

def update_supabase_game(room_code, guessed_letters, errors, status="playing"):
    # Limpiamos la URL para que no tenga problemas de formato
    base_url = SUPABASE_URL.rstrip('/')
    url = f"{base_url}/rest/v1/games?room_code=eq.{room_code}"
    
    # IMPORTANTE: Estos nombres deben ser EXACTOS a tu captura de pantalla
    data = {
        "guessed_letters": guessed_letters, # Array de strings
        "errors": int(errors),              # Aseguramos que sea un número entero
        "status": status                    # Texto
    }
    
    with httpx.Client() as client:
        response = client.patch(url, json=data, headers=headers)
        
        if response.status_code not in [200, 204]:
            # Este print te dirá el error exacto en la terminal de Uvicorn
            print(f"DEBUG SUPABASE: {response.status_code} - {response.text}")
            return False
        return True