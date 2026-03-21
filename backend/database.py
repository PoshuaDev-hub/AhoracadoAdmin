# backend/database.py
import os
import httpx
from dotenv import load_dotenv

# Forzamos la carga del .env y limpiamos espacios
load_dotenv(override=True)

SUPABASE_URL = str(os.getenv("SUPABASE_URL")).strip()
SUPABASE_KEY = str(os.getenv("SUPABASE_KEY")).strip()

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def create_supabase_game(data):
    url = f"{SUPABASE_URL}/rest/v1/games"
    
    # IMPORTANTE: No envíes campos que no existan.
    # Usamos los nombres exactos de tu captura de pantalla.
    initial_data = {
        "room_code": data.get("room_code"),
        "word": data.get("word"),
        "guessed_letters": [], # Supabase espera un jsonb, esto es correcto
        "errors": 0,           # Confirmamos que en tu DB se llama 'errors'
        "status": "playing"
    }

    # Verifica que no haya espacios extra en los headers
    custom_headers = {
        "apikey": SUPABASE_KEY.strip(),
        "Authorization": f"Bearer {SUPABASE_KEY.strip()}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    with httpx.Client() as client:
        response = client.post(url, json=initial_data, headers=custom_headers)
        if response.status_code != 201:
            # ESTA LÍNEA ES CLAVE: Mira tu terminal cuando falle, dirá el motivo exacto
            print(f"DETALLE DEL ERROR: {response.text}")
            return None
        return response.json()[0]

def get_supabase_game(room_code):
    url = f"{SUPABASE_URL}/rest/v1/games?room_code=eq.{room_code}"
    with httpx.Client() as client:
        response = client.get(url, headers=headers)
        res_data = response.json()
        return res_data[0] if res_data else None

def update_supabase_game(room_code, guessed_letters, errors, status="playing"):
    url = f"{SUPABASE_URL}/rest/v1/games?room_code=eq.{room_code}"
    # IMPORTANTE: Aquí usamos 'errors' porque así sale en tu imagen de la DB
    data = {
        "guessed_letters": guessed_letters,
        "errors": int(errors),
        "status": status
    }
    with httpx.Client() as client:
        response = client.patch(url, json=data, headers=headers)
        return response.status_code in [200, 204]