from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import database
import uuid

app = FastAPI()

# Configuración de CORS para conectar con Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/game/create")
async def create_game(word: str):
    room_code = str(uuid.uuid4())[:6].upper()
    
    game_data = {
        "room_code": room_code,
        "word": word.lower(),
        "guessed_letters": [],
        "errors": 0,
        "status": "playing"
    }
    
    result = database.create_supabase_game(game_data)
    if result:
        return {"room_code": room_code}
    
    raise HTTPException(status_code=500, detail="Error al guardar en Supabase")

@app.get("/game/{code}")
async def get_game(code: str):
    game = database.get_supabase_game(code)
    if not game:
        raise HTTPException(status_code=404, detail="Juego no encontrado")
    return game

@app.patch("/game/{code}/guess")
async def update_guess(code: str, payload: dict):
    # Extracción segura con valores por defecto
    guessed_letters = payload.get("guessed_letters", [])
    errors = payload.get("errors", 0)
    
    # Llamada a database.py (asegúrate de que en database.py la columna se llame 'errors')
    success = database.update_supabase_game(code, guessed_letters, errors)
    
    if success:
        return {"status": "success"}
    
    raise HTTPException(status_code=400, detail="Error al actualizar la jugada")