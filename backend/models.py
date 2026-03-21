from fastapi import FastAPI, HTTPException
from database import supabase
import secrets

app = FastAPI()

@app.post("/game/create")
def create_game(word: str):
    room_code = secrets.token_hex(3).upper()
    
    # Insertar directamente en la tabla de Supabase
    data, count = supabase.table("games").insert({
        "room_code": room_code,
        "word": word.lower(),
        "guessed_letters": [],
        "attempts": 0,
        "status": "playing"
    }).execute()
    
    return {"room_code": room_code}

@app.get("/game/{code}")
def get_game(code: str):
    response = supabase.table("games").select("*").eq("room_code", code).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    return response.data[0]