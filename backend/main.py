from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import database
import uuid
import httpx  # IMPORTANTE: Asegúrate de tenerlo para el DELETE

app = FastAPI()

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
    if result: return {"room_code": room_code}
    raise HTTPException(status_code=500, detail="Error en Supabase")

@app.get("/game/{code}")
async def get_game(code: str):
    game = database.get_supabase_game(code)
    if not game: raise HTTPException(status_code=404, detail="No existe")
    return game

@app.patch("/game/{code}/guess")
async def update_guess(code: str, payload: dict):
    guessed_letters = payload.get("guessed_letters", [])
    errors = payload.get("errors", 0)
    success = database.update_supabase_game(code, guessed_letters, errors)
    if success: return {"status": "ok"}
    raise HTTPException(status_code=400, detail="Error al actualizar")

# NUEVO ENDPOINT: Para borrar la partida al finalizar
@app.delete("/game/{code}")
async def delete_game(code: str):
    # Usamos las variables de configuración que ya tienes en database.py
    url = f"{database.SUPABASE_URL}/rest/v1/games?room_code=eq.{code}"
    
    async with httpx.AsyncClient() as client: # Usamos AsyncClient por ser FastAPI
        response = await client.delete(url, headers=database.headers)
        
        if response.status_code in [200, 204]:
            return {"status": "deleted"}
            
    raise HTTPException(status_code=400, detail="No se pudo borrar el registro")