"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGame() {
  const [word, setWord] = useState("");
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    if (word.length < 3) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    try {
      // 1. Enviamos la palabra al backend de Python
      // Usamos 127.0.0.1 para evitar problemas de DNS local
        const response = await fetch(`http://127.0.0.1:8000/game/create?word=${word}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Error en el servidor");

      const data = await response.json();
      
      // 2. Si el backend nos devuelve el código, navegamos a la sala
      if (data.room_code) {
        router.push(`/join/${data.room_code}`);
      } else {
        alert("El servidor no devolvió un código de sala");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el backend. ¿Está uvicorn encendido?");
    }
  };

  return (
    <main className="paper-container fade-in no-zoom-area">
      <div className="pos-title">
        <h2>Palabra <br /> Secreta</h2>
      </div>
      
      <div className="pos-input">
        {showError && <div className="error-bubble">¡Mínimo 3 letras!</div>}
        <input
          type="password"
          className="input-palabra"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          autoFocus
          placeholder="Escribe aquí..."
          autoComplete="off"
        />
      </div>

      <div className="pos-button">
        <button onClick={handleStart} className="key-btn text-xl px-10 py-3">
          LISTO, CREAR SALA
        </button>
      </div>
    </main>
  );
}